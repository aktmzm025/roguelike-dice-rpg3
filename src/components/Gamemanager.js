import React, { useCallback, useMemo, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { useDice } from '../hooks/useDice';

// 기존 컴포넌트 임포트
import MainMenu from './Menu/MainMenu';
import CharacterSelect from './Character/CharacterSelect';
import GameScreen from './Game/GameScreen';
import CombatScreen from './Combat/CombatScreen';
import EventScreen from './Events/EventScreen';
import CardRewardScreen from './Card/CardRewardScreen';
import SkillInventoryScreen from './Card/SkillInventoryScreen';
import ArtifactSelectScreen from './Artifact/ArtifactSelectScreen';
import ArtifactInventoryScreen from './Artifact/ArtifactInventoryScreen';

// 새로운 애니메이션 컴포넌트 임포트
import TransitionWrapper from './UI/TransitionWrapper';
import { DamageNumber, CardEffect, StatusEffectAnimation, EffectManager, EFFECT_TYPES, EFFECT_INTENSITY, getEffectIntensityFromDamage } from './Effects';
import DiceIcon from './UI/DiceIcon';

// 유틸리티 임포트
import { createPlayer } from '../utils/gameUtils';
import { classes } from '../data/gameData';
import { cardsByClass } from '../data/card';
import {
  shouldStartCombat,
  generateRandomEvent,
  generateRandomMonster,
  generateBoss,
  getStageType,
  shouldDropArtifact,
  generateStartingArtifacts,
  generateArtifactDrop
} from '../utils/gameUtils';
import {
  calculateElementalDamage,
  calculateAttackBonus,
  applyDefense,
  getFinalDamage,
  calculateGoldReward,
  calculateDamageWithArtifacts,
  calculateDefenseWithArtifacts
} from '../utils/combatUtils';
import {
  calculateDodgeRate,
  isAttackDodged
} from '../utils/diceUtils';
import { gameConstants } from '../data/gameData';

const GameManager = () => {
  const { state, actions } = useGameContext();
  const { diceResult, isRolling, animateRoll, resetDice } = useDice();
  
  // 애니메이션 상태 관리
  const [effectManager] = useState(() => new EffectManager());
  const [activeEffects, setActiveEffects] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);

  // 이펙트 추가 함수
  const addDamageNumber = useCallback((damage, position, options = {}) => {
    const id = Date.now() + Math.random();
    const damageNumberData = {
      id,
      damage,
      position,
      ...options,
      onComplete: () => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
      }
    };
    
    setDamageNumbers(prev => [...prev, damageNumberData]);
  }, []);

  const addCardEffect = useCallback((effectType, position, options = {}) => {
    const id = Date.now() + Math.random();
    const effectData = {
      id,
      effectType,
      position,
      intensity: getEffectIntensityFromDamage(options.damage || 0),
      ...options,
      onComplete: () => {
        setActiveEffects(prev => prev.filter(e => e.id !== id));
      }
    };
    
    setActiveEffects(prev => [...prev, effectData]);
  }, []);

  // 전투 위치 계산 (화면 중앙 기준)
  const getCombatPosition = useCallback((isPlayer = true) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    return {
      x: isPlayer ? centerX - 200 : centerX + 200,
      y: centerY
    };
  }, []);

  // 캐릭터 선택 핸들러
  const handleCharacterSelect = useCallback((classType) => {
    const classData = classes[classType];
    const newPlayer = {
      class: classType,
      ...classData,
      currentHp: classData.baseHp,
      skills: [],
      defense: {
        name: '기본 방어',
        reduction: gameConstants.DEFAULT_DEFENSE_REDUCTION
      },
      position: {
        stage: 1,
        layer: 1
      }
    };

    const classCards = cardsByClass[classType];
    const basicSkills = classCards.filter(card => card.rarity === 'common').slice(0, 4);

    actions.setPlayer(newPlayer);
    actions.setSelectedClass(classType);

    basicSkills.forEach(skill => {
      actions.addToSkillInventory(skill);
    });

    actions.setEquippedSkills(basicSkills);

    const startingArtifacts = generateStartingArtifacts(classType);
    if (startingArtifacts.length > 0) {
      actions.setArtifactRewards(startingArtifacts);
      actions.setGameState('artifact_select');
    } else {
      actions.setGameState('game');
    }
  }, [actions]);

  // 캐릭터 변경 핸들러
  const handleChangeCharacter = useCallback(() => {
    actions.setGameState('character_select');
  }, [actions]);

  // 카드 보상 생성 함수
  const generateCardRewards = useCallback(() => {
    const selectedClass = state.selectedClass;
    if (!selectedClass) return [];

    const classCards = cardsByClass[selectedClass];
    const rewards = [];

    for (let i = 0; i < 3; i++) {
      let randomCard;
      let attempts = 0;

      do {
        randomCard = classCards[Math.floor(Math.random() * classCards.length)];
        attempts++;
      } while (
        rewards.some(card => card.id === randomCard.id) &&
        attempts < 50
      );

      rewards.push(randomCard);
    }

    return rewards;
  }, [state.selectedClass]);

  // 카드 선택 핸들러
  const handleCardSelect = useCallback((selectedCard) => {
    actions.addToSkillInventory(selectedCard);
    actions.resetTotalTurns();
    actions.setGameState('game');
  }, [actions]);

  // 카드 보상 건너뛰기 핸들러
  const handleSkipCardReward = useCallback(() => {
    actions.resetTotalTurns();
    actions.setGameState('game');
  }, [actions]);

  // 스킬 인벤토리 핸들러
  const handleOpenSkillInventory = useCallback(() => {
    actions.setGameState('skill_inventory');
  }, [actions]);

  // 스킬 장착 핸들러
  const handleEquipSkills = useCallback((skills) => {
    actions.setEquippedSkills(skills);
    actions.setGameState('game');
  }, [actions]);

  // 아티펙트 선택 핸들러
  const handleArtifactSelect = useCallback((selectedArtifact) => {
    actions.addArtifact(selectedArtifact);
    actions.clearArtifactRewards();
    
    // 레벨업 이펙트 추가
    const centerPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    addCardEffect('magic', centerPosition, { 
      effectType: 'artifact_acquire',
      intensity: EFFECT_INTENSITY.STRONG,
      element: 'none',
      duration: 1500
    });
    
    if (state.gameState === 'artifact_select' && state.currentStage === 1 && state.currentLayer === 1) {
      actions.setGameState('game');
    } else {
      actions.setGameState('game');
    }
  }, [actions, state.gameState, state.currentStage, state.currentLayer, addCardEffect]);

  // 아티펙트 선택 건너뛰기 핸들러
  const handleSkipArtifact = useCallback(() => {
    actions.clearArtifactRewards();
    actions.setGameState('game');
  }, [actions]);

  // 아티펙트 인벤토리 핸들러
  const handleOpenArtifactInventory = useCallback(() => {
    actions.setGameState('artifact_inventory');
  }, [actions]);

  // 메인으로 가기 핸들러
  const handleGoToMenu = useCallback(() => {
    if (window.confirm('정말로 메인 메뉴로 돌아가시겠습니까? 현재 진행사항은 저장되지 않습니다.')) {
      actions.goToMenu();
    }
  }, [actions]);

  // 스테이지 진행 핸들러
  const handleProceedStage = useCallback(() => {
    resetDice();

    if (shouldStartCombat()) {
      const stageType = getStageType(state.currentStage);
      let enemy;

      if (stageType === 'boss' || stageType === 'mini_boss') {
        enemy = generateBoss(state.currentStage);
      } else {
        enemy = generateRandomMonster();
      }

      actions.setEnemy(enemy);
      actions.clearCombatLog();
      actions.startCombatTimer();
      actions.addCombatLog(`=== 전투 시작 ===`);
      actions.addCombatLog(`${enemy.name}과(와) 전투를 시작합니다!`);
      actions.setPlayerTurn(true);
      actions.setGameState('combat');
    } else {
      const event = generateRandomEvent();
      actions.setEvent(event);
      actions.setGameState('event');
    }
  }, [state.currentStage, actions, resetDice]);

  // 상태효과 적용 함수
  const applyStatusEffects = useCallback((skill, isPlayerAttack) => {
    if (!skill.stun && !skill.poison && !skill.freeze) return;

    if (isPlayerAttack) {
      if (skill.stun) {
        actions.setEnemyStatusEffect('stun', 1);
        actions.addCombatLog(`${state.currentEnemy.name}이(가) 기절했습니다! (1턴 행동 불가)`);
      }
      if (skill.poison) {
        actions.setEnemyStatusEffect('poison', 3);
        actions.addCombatLog(`${state.currentEnemy.name}이(가) 중독되었습니다! (3턴간 지속)`);
      }
      if (skill.freeze) {
        actions.setEnemyStatusEffect('freeze', 2);
        actions.addCombatLog(`${state.currentEnemy.name}이(가) 빙결되었습니다! (2턴간 행동 불가)`);
      }
    } else {
      if (skill.stun) {
        actions.setPlayerStatusEffect('stun', 1);
        actions.addCombatLog(`플레이어가 기절했습니다! (1턴 행동 불가)`);
      }
    }
  }, [actions, state.currentEnemy]);

  // ✅ 수정된 전투 공격 처리 (애니메이션 통합)
  const executeAttack = useCallback((attacker, defender, skill, isPlayerAttack = true) => {
    const hitCount = skill.hits || 1;
    let totalDamage = 0;
    let totalHits = 0;
    let messages = [];

    // 각 공격마다 개별적으로 처리
    for (let hit = 1; hit <= hitCount; hit++) {
      const dodgeRate = calculateDodgeRate(defender.luck || defender.baseLuck);

      if (isAttackDodged(dodgeRate)) {
        messages.push(`공격 ${hit}/${hitCount}: ${defender.name || '플레이어'}가 회피했습니다!`);
        continue;
      }

      totalHits++;
      let damage = skill.damage;

      if (isPlayerAttack && state.artifacts) {
        damage = calculateDamageWithArtifacts(damage, skill, state.artifacts, defender);
      } else if (attacker.baseAttack) {
        damage += calculateAttackBonus(attacker.baseAttack);
      }

      const attackerElement = skill.element || attacker.element;
      const defenderElement = defender.element;
      const originalDamage = damage;
      damage = calculateElementalDamage(attackerElement, defenderElement, damage);

      if (defender.defense && !isPlayerAttack) {
        damage = calculateDefenseWithArtifacts(damage, state.artifacts);
      } else if (defender.defense && !attacker.baseAttack) {
        damage = applyDefense(damage, defender.defense.reduction);
      }

      damage = getFinalDamage(damage);
      totalDamage += damage;

      // 애니메이션 효과 추가
      const targetPosition = getCombatPosition(!isPlayerAttack);
      
      // 피해 숫자 애니메이션
      addDamageNumber(damage, targetPosition, {
        isHealing: damage < 0,
        isCritical: damage > originalDamage * 1.3,
        isPlayerDamage: !isPlayerAttack,
        type: skill.poison ? 'poison' : skill.burn ? 'burn' : skill.freeze ? 'freeze' : 'normal'
      });

      // 카드 이펙트 애니메이션
      let effectType = EFFECT_TYPES.ATTACK;
      if (skill.type === 'magic') effectType = EFFECT_TYPES.MAGIC;
      if (damage < 0) effectType = EFFECT_TYPES.HEAL;
      if (damage > originalDamage * 1.3) effectType = EFFECT_TYPES.CRITICAL;
      if (hitCount > 1) effectType = EFFECT_TYPES.MULTI_HIT;

      addCardEffect(effectType, targetPosition, {
        damage,
        element: skill.element || 'none',
        duration: hitCount > 1 ? 800 : 1000
      });

      let hitMessage = `공격 ${hit}/${hitCount}: ${damage} 피해`;
      if (damage > originalDamage) {
        hitMessage += " (효과는 굉장했다!)";
      } else if (damage < originalDamage) {
        hitMessage += " (효과는 별로였다...)";
      }
      messages.push(hitMessage);
    }

    if (totalHits > 0) {
      applyStatusEffects(skill, isPlayerAttack);
    }

    let finalMessage;
    if (totalHits === 0) {
      finalMessage = `${skill.name}: 모든 공격이 빗나갔습니다!`;
    } else if (hitCount > 1) {
      finalMessage = `${skill.name}: ${totalHits}/${hitCount} 명중, 총 ${totalDamage} 피해!`;
    } else {
      finalMessage = `${skill.name}: ${totalDamage} 피해!`;
    }

    return {
      hit: totalHits > 0,
      damage: totalDamage,
      hitCount: totalHits,
      maxHits: hitCount,
      message: finalMessage,
      detailedMessages: messages
    };
  }, [applyStatusEffects, state.artifacts, getCombatPosition, addDamageNumber, addCardEffect]);

  // ✅ 스킬 선택 핸들러 - 애니메이션 통합
  const handleSkillSelect = useCallback((skill) => {
    if (!state.isPlayerTurn || isRolling || !state.player || !state.currentEnemy) return;

    if (state.playerStatusEffects.stun > 0 || state.playerStatusEffects.freeze > 0) {
      actions.addCombatLog(`[턴 ${state.currentTurn}] 플레이어가 상태효과로 인해 행동할 수 없습니다!`);
      actions.setPlayerTurn(false);
      actions.incrementTurn();
      actions.reduceStatusEffects();

      setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
      return;
    }

    animateRoll((rollResult) => {
      actions.addCombatLog(`[턴 ${state.currentTurn}] 플레이어의 공격!`);

      const result = executeAttack(state.player, state.currentEnemy, skill, true);
      
      if (skill.hits && skill.hits > 1) {
        actions.addCombatLog(`🔥 ${skill.name} (${skill.hits}회 연속 공격 시도):`);
        result.detailedMessages.forEach(msg => {
          actions.addCombatLog(`  └ ${msg}`);
        });
      }
      
      actions.addCombatLog(result.message);

      if (result.hit) {
        const newEnemyHp = Math.max(0, state.currentEnemy.currentHp - result.damage);
        actions.updateEnemyHp(newEnemyHp);

        if (newEnemyHp <= 0) {
          // 적 처치 애니메이션
          const enemyPosition = getCombatPosition(false);
          addCardEffect(EFFECT_TYPES.CRITICAL, enemyPosition, {
            effectType: 'enemy_defeat',
            intensity: EFFECT_INTENSITY.CRITICAL,
            duration: 2000
          });

          const goldReward = calculateGoldReward(1, getStageType(state.currentStage) !== 'normal');
          actions.addCombatLog(`${state.currentEnemy.name}을(를) 처치했습니다!`);
          actions.addCombatLog(`${goldReward} 골드를 획득했습니다!`);
          
          const isBoss = getStageType(state.currentStage) !== 'normal';
          if (shouldDropArtifact(isBoss)) {
            const artifactDrop = generateArtifactDrop(state.selectedClass, state.artifacts, isBoss);
            if (artifactDrop.length > 0) {
              actions.addCombatLog(`아티펙트를 발견했습니다!`);
              setTimeout(() => {
                actions.setArtifactRewards(artifactDrop);
                actions.setGameState('artifact_select');
              }, 3000);
              return;
            }
          }
          
          actions.addCombatLog(`=== 전투 종료 ===`);
          actions.addGold(goldReward);
          actions.incrementKillCount();
          actions.incrementTotalTurns();
          const newTotalTurns = state.totalTurns + 1;

          setTimeout(() => {
            if (newTotalTurns % 3 === 0) {
              const cardRewards = generateCardRewards();
              actions.setCardRewards(cardRewards);
              actions.setGameState('card_reward');
              return;
            }

            if (state.currentStage === gameConstants.STAGES_PER_LAYER) {
              actions.updatePlayerHp(state.player.baseHp);
              actions.setLayer(state.currentLayer + 1);
              actions.setStage(1);
            } else {
              actions.setStage(state.currentStage + 1);
            }

            actions.setEnemy(null);
            actions.clearCombatLog();
            actions.setGameState('game');
          }, 3000);
          return;
        }
      }

      actions.setPlayerTurn(false);
      actions.incrementTurn();
      actions.reduceStatusEffects();

      setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
    });
  }, [
    state.isPlayerTurn,
    state.player,
    state.currentEnemy,
    state.currentStage,
    state.currentLayer,
    state.totalTurns,
    state.currentTurn,
    state.playerStatusEffects,
    state.artifacts,
    state.selectedClass,
    isRolling,
    actions,
    animateRoll,
    executeAttack,
    generateCardRewards,
    getCombatPosition,
    addCardEffect
  ]);

  // 적 턴 처리
  const handleEnemyTurn = useCallback(() => {
    if (!state.currentEnemy || state.currentEnemy.currentHp <= 0 || !state.player || state.player.currentHp <= 0) {
      return;
    }

    if (state.enemyStatusEffects.stun > 0 || state.enemyStatusEffects.freeze > 0) {
      actions.addCombatLog(`[턴 ${state.currentTurn}] ${state.currentEnemy.name}이(가) 상태효과로 인해 행동할 수 없습니다!`);

      setTimeout(() => {
        actions.setPlayerTurn(true);
        actions.incrementTurn();
        actions.reduceStatusEffects();
      }, 1000);
      return;
    }

    actions.addCombatLog(`[턴 ${state.currentTurn}] ${state.currentEnemy.name}의 공격!`);

    const enemySkill = {
      name: '공격',
      damage: state.currentEnemy.attack,
      element: state.currentEnemy.element
    };
    const enemyResult = executeAttack(state.currentEnemy, state.player, enemySkill, false);
    actions.addCombatLog(enemyResult.message);

    if (enemyResult.hit) {
      const newPlayerHp = Math.max(0, state.player.currentHp - enemyResult.damage);
      actions.updatePlayerHp(newPlayerHp);

      if (newPlayerHp <= 0) {
        actions.addCombatLog('게임 오버...');
        actions.addCombatLog(`=== 전투 종료 ===`);
        
        // 게임 오버 이펙트
        const playerPosition = getCombatPosition(true);
        addCardEffect('critical', playerPosition, {
          effectType: 'game_over',
          intensity: EFFECT_INTENSITY.CRITICAL,
          element: 'none',
          duration: 3000
        });
        
        setTimeout(() => {
          actions.resetGame();
        }, 2000);
        return;
      }
    }

    setTimeout(() => {
      actions.setPlayerTurn(true);
      actions.incrementTurn();
      actions.reduceStatusEffects();
    }, 1000);
  }, [
    state.currentEnemy,
    state.player,
    state.currentTurn,
    state.enemyStatusEffects,
    actions,
    executeAttack,
    getCombatPosition,
    addCardEffect
  ]);

  // 이벤트 선택 핸들러
  const handleEventChoice = useCallback((choice) => {
    const event = state.currentEvent;
    if (!event) return;

    switch (event.type) {
      case 'heal':
        if (choice === 'accept') {
          const healAmount = event.value();
          actions.updatePlayerHp(state.player.currentHp + healAmount);
          
          // 힐링 이펙트
          const centerPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
          addDamageNumber(healAmount, centerPosition, { isHealing: true });
          addCardEffect(EFFECT_TYPES.HEAL, centerPosition, { duration: 1500 });
          
          alert(`${healAmount} 체력을 회복했습니다!`);
        }
        break;

      case 'trap':
        if (choice === 'roll') {
          animateRoll((rollResult) => {
            if (rollResult >= 6) {
              alert('함정을 성공적으로 회피했습니다!');
            } else {
              const damage = event.value();
              actions.updatePlayerHp(state.player.currentHp - damage);
              
              // 함정 피해 이펙트
              const centerPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
              addDamageNumber(damage, centerPosition, { isPlayerDamage: true });
              addCardEffect('attack', centerPosition, { damage, element: 'none' });
              
              alert(`함정에 걸려 ${damage} 피해를 받았습니다!`);
            }

            actions.incrementTotalTurns();
            const newTotalTurns = state.totalTurns + 1;

            setTimeout(() => {
              if (newTotalTurns % 3 === 0) {
                const cardRewards = generateCardRewards();
                actions.setCardRewards(cardRewards);
                actions.setEvent(null);
                actions.setGameState('card_reward');
                resetDice();
                return;
              }

              actions.setStage(state.currentStage + 1);
              actions.setEvent(null);
              actions.setGameState('game');
              resetDice();
            }, 2000);
          });
          return;
        } else if (choice === 'avoid') {
          alert('조심스럽게 함정을 우회했습니다.');
        }
        break;

      case 'treasure':
        if (choice === 'open') {
          const goldAmount = event.value();
          actions.addGold(goldAmount);
          
          // 골드 획득 이펙트
          const centerPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
          addCardEffect('magic', centerPosition, { 
            effectType: 'gold_gain',
            intensity: EFFECT_INTENSITY.NORMAL,
            element: 'none'
          });
          
          alert(`보물 상자에서 ${goldAmount} 골드를 발견했습니다!`);
        } else if (choice === 'ignore') {
          alert('보물 상자를 무시하고 지나갔습니다.');
        }
        break;

      default:
        break;
    }

    if (event.type !== 'trap' || choice !== 'roll') {
      actions.incrementTotalTurns();
      const newTotalTurns = state.totalTurns + 1;

      setTimeout(() => {
        if (newTotalTurns % 3 === 0) {
          const cardRewards = generateCardRewards();
          actions.setCardRewards(cardRewards);
          actions.setEvent(null);
          actions.setGameState('card_reward');
          return;
        }

        actions.setStage(state.currentStage + 1);
        actions.setEvent(null);
        actions.setGameState('game');
      }, 1000);
    }
  }, [state.currentEvent, state.player, state.currentStage, state.totalTurns, actions, animateRoll, resetDice, generateCardRewards, addDamageNumber, addCardEffect]);

  // 주사위 컴포넌트 메모화
  const diceComponent = useMemo(() => {
    return diceResult ? (
      <DiceIcon value={diceResult} isRolling={isRolling} />
    ) : null;
  }, [diceResult, isRolling]);

  // 화면 렌더링
  const renderScreen = () => {
    const screenComponent = (() => {
      switch (state.gameState) {
        case 'menu':
          return (
            <MainMenu
              onStartGame={() => {
                if (state.selectedClass) {
                  const newPlayer = createPlayer(state.selectedClass, classes[state.selectedClass]);
                  actions.setPlayer(newPlayer);
                  actions.setGameState('game');
                } else {
                  actions.setGameState('character_select');
                }
              }}
              onChangeCharacter={handleChangeCharacter}
              onOpenSkillInventory={handleOpenSkillInventory}
              onOpenArtifactInventory={handleOpenArtifactInventory}
              gold={state.gold}
              selectedClass={state.selectedClass}
              player={state.player}
              skillInventory={state.skillInventory}
              equippedSkills={state.equippedSkills}
              artifacts={state.artifacts}
            />
          );

        case 'character_select':
          return (
            <CharacterSelect
              onSelectCharacter={handleCharacterSelect}
              onGoToMenu={handleGoToMenu}
            />
          );

        case 'game':
          return (
            <GameScreen
              player={state.player}
              currentStage={state.currentStage}
              currentLayer={state.currentLayer}
              gold={state.gold}
              onProceedStage={handleProceedStage}
              onGoToMenu={handleGoToMenu}
              onOpenSkillInventory={handleOpenSkillInventory}
              onOpenArtifactInventory={handleOpenArtifactInventory}
              killCount={state.killCount}
              totalTurns={state.totalTurns}
              artifacts={state.artifacts}
              diceResult={diceResult}
              DiceComponent={diceComponent}
            />
          );

        case 'combat':
          return (
            <CombatScreen
              player={state.player}
              enemy={state.currentEnemy}
              combatLog={state.combatLog}
              onSkillSelect={handleSkillSelect}
              onGoToMenu={handleGoToMenu}
              isPlayerTurn={state.isPlayerTurn}
              diceResult={diceResult}
              DiceComponent={diceComponent}
              isRolling={isRolling}
              currentTurn={state.currentTurn}
              playerStatusEffects={state.playerStatusEffects}
              enemyStatusEffects={state.enemyStatusEffects}
            />
          );

        case 'event':
          return (
            <EventScreen
              event={state.currentEvent}
              onEventChoice={handleEventChoice}
              onGoToMenu={handleGoToMenu}
              diceResult={diceResult}
              DiceComponent={diceComponent}
              isRolling={isRolling}
            />
          );

        case 'card_reward':
          return (
            <CardRewardScreen
              cardRewards={state.cardRewards}
              onSelectCard={handleCardSelect}
              onSkip={handleSkipCardReward}
              totalTurns={state.totalTurns}
            />
          );

        case 'skill_inventory':
          return (
            <SkillInventoryScreen
              skillInventory={state.skillInventory}
              equippedSkills={state.equippedSkills}
              onEquipSkills={handleEquipSkills}
              onGoBack={() => actions.setGameState('game')}
              onGoToMenu={handleGoToMenu}
            />
          );

        case 'artifact_select':
          return (
            <ArtifactSelectScreen
              artifactRewards={state.artifactRewards}
              onSelectArtifact={handleArtifactSelect}
              onSkip={handleSkipArtifact}
              isStartSelection={state.currentStage === 1 && state.currentLayer === 1 && !state.player}
            />
          );

        case 'artifact_inventory':
          return (
            <ArtifactInventoryScreen
              artifacts={state.artifacts}
              onGoBack={() => actions.setGameState('game')}
              onGoToMenu={handleGoToMenu}
            />
          );

        default:
          return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-white text-2xl">Loading...</div>
            </div>
          );
      }
    })();

    return (
      <TransitionWrapper gameState={state.gameState} showParticles={true}>
        {screenComponent}
      </TransitionWrapper>
    );
  };

  return (
    <div className="game-container relative">
      {renderScreen()}
      
      {/* 전역 애니메이션 효과들 */}
      {damageNumbers.map((damageData) => (
        <DamageNumber key={damageData.id} {...damageData} />
      ))}
      
      {activeEffects.map((effectData) => (
        <CardEffect key={effectData.id} {...effectData} />
      ))}
      
      {/* 전투 화면에서만 상태 효과 애니메이션 표시 */}
      {state.gameState === 'combat' && state.player && (
        <StatusEffectAnimation
          statusEffects={state.playerStatusEffects}
          position={getCombatPosition(true)}
          isPlayer={true}
        />
      )}
      
      {state.gameState === 'combat' && state.currentEnemy && (
        <StatusEffectAnimation
          statusEffects={state.enemyStatusEffects}
          position={getCombatPosition(false)}
          isPlayer={false}
        />
      )}
    </div>
  );
};

export default GameManager;