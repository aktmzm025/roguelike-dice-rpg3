import React, { useState, useEffect } from 'react';
import PlayerStatus from './PlayerStatus';
import EnemyStatus from './EnemyStatus';
import SkillPanel from './SkillPanel';
import CombatLog from './CombatLog';
import Button from '../UI/Button';
import { DiceRollAnimation } from '../Effects';

const CombatScreen = ({ 
  player, 
  enemy, 
  combatLog, 
  onSkillSelect, 
  onGoToMenu,
  isPlayerTurn,
  diceResult,
  DiceComponent,
  isRolling,
  currentTurn = 1,
  playerStatusEffects = {},
  enemyStatusEffects = {}
}) => {
  const [screenShake, setScreenShake] = useState(false);
  const [turnTransition, setTurnTransition] = useState(false);
  const [combatPhase, setCombatPhase] = useState('normal'); // 'normal', 'critical', 'victory', 'defeat'

  // 전투 상황에 따른 화면 효과
  useEffect(() => {
    // 체력이 낮을 때 화면 효과
    if (player && player.currentHp / player.baseHp <= 0.2) {
      setCombatPhase('critical');
    } else if (enemy && enemy.currentHp / enemy.hp <= 0.2) {
      setCombatPhase('critical');
    } else {
      setCombatPhase('normal');
    }
  }, [player, enemy]);

  // 턴 변경 시 전환 효과
  useEffect(() => {
    setTurnTransition(true);
    setTimeout(() => setTurnTransition(false), 500);
  }, [currentTurn]);

  // 스킬 사용시 화면 진동 효과
  const handleSkillWithEffect = (skill) => {
    if (skill.damage >= 10 || skill.hits > 1) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }
    onSkillSelect(skill);
  };

  const getTurnIndicator = () => {
    const hasPlayerDebuff = playerStatusEffects.stun > 0 || playerStatusEffects.freeze > 0;
    const hasEnemyDebuff = enemyStatusEffects.stun > 0 || enemyStatusEffects.freeze > 0;
    
    if (isPlayerTurn) {
      return (
        <div className={`text-center transition-all duration-300 ${hasPlayerDebuff ? 'text-red-400 animate-shake' : 'text-green-400 animate-pulse'}`}>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">👤</span>
            <span className="font-bold">
              {hasPlayerDebuff ? '상태효과로 행동 불가' : '당신의 턴입니다'}
            </span>
            {!hasPlayerDebuff && <span className="text-xl animate-bounce">⚡</span>}
          </div>
        </div>
      );
    } else {
      return (
        <div className={`text-center transition-all duration-300 ${hasEnemyDebuff ? 'text-purple-400' : 'text-red-400 animate-pulse'}`}>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">👹</span>
            <span className="font-bold">
              {hasEnemyDebuff ? '적이 상태효과로 행동 불가' : '적의 턴입니다'}
            </span>
            {!hasEnemyDebuff && <span className="text-xl animate-bounce">💀</span>}
          </div>
        </div>
      );
    }
  };

  const getBackgroundEffects = () => {
    switch (combatPhase) {
      case 'critical':
        return 'bg-gradient-to-br from-red-900 via-red-800 to-black';
      case 'victory':
        return 'bg-gradient-to-br from-green-900 via-green-800 to-black';
      case 'defeat':
        return 'bg-gradient-to-br from-gray-900 via-black to-red-900';
      default:
        return 'bg-gradient-red';
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-all duration-1000 ${getBackgroundEffects()} ${screenShake ? 'animate-shake' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* 전투 헤더 - 강화된 애니메이션 */}
        <div className={`text-center mb-6 ${turnTransition ? 'animate-scale-in' : ''}`}>
          <h2 className="text-3xl font-bold text-white mb-2 animate-glow">
            ⚔️ 전투 중 ⚔️
          </h2>
          
          {/* 턴 정보 - 향상된 디자인 */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4 border-2 border-gray-600 shadow-lg">
            <div className="text-white text-lg font-bold mb-2 flex items-center justify-center space-x-2">
              <span className="animate-spin-slow">🎲</span>
              <span>턴 {currentTurn}</span>
              <span className="animate-pulse">⏱️</span>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              {getTurnIndicator()}
              
              <Button
                onClick={onGoToMenu}
                variant="danger"
                size="sm"
                disabled={isRolling}
                animationType="shake"
                icon="🏃"
              >
                도망가기
              </Button>
            </div>
          </div>
        </div>

        {/* 전투 상태 표시 - 애니메이션 강화 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`transform transition-all duration-500 ${isPlayerTurn ? 'scale-105 ring-2 ring-green-400' : 'scale-100'}`}>
            <PlayerStatus 
              player={player} 
              statusEffects={playerStatusEffects}
            />
          </div>
          
          <div className={`transform transition-all duration-500 ${!isPlayerTurn ? 'scale-105 ring-2 ring-red-400' : 'scale-100'}`}>
            <EnemyStatus 
              enemy={enemy} 
              statusEffects={enemyStatusEffects}
            />
          </div>
        </div>

        {/* 메인 전투 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 스킬 패널 - 강화된 애니메이션 */}
          <div className="order-2 lg:order-1">
            <div className={`transform transition-all duration-300 ${isPlayerTurn && !isRolling ? 'animate-glow' : ''}`}>
              <SkillPanel
                skills={player?.skills || []}
                onSkillSelect={handleSkillWithEffect}
                onGoToMenu={onGoToMenu}
                disabled={isRolling || (playerStatusEffects.stun > 0 || playerStatusEffects.freeze > 0)}
                isPlayerTurn={isPlayerTurn}
              />
            </div>
          </div>

          {/* 전투 로그 */}
          <div className="order-1 lg:order-2">
            <CombatLog logs={combatLog} />
          </div>
        </div>

        {/* 주사위 결과 표시 - 애니메이션 강화 */}
        {diceResult && (
          <div className="bg-gray-800 rounded-lg p-6 mt-6 text-center border-2 border-blue-500 shadow-xl">
            <div className="text-white mb-3 text-lg font-bold animate-pulse">🎲 주사위 결과</div>
            
            <div className="flex justify-center mb-3">
              <DiceRollAnimation
                finalValue={diceResult}
                isRolling={isRolling}
                size="large"
                glowColor="blue"
              />
            </div>
            
            <div className="text-white text-2xl font-bold animate-bounce">{diceResult}</div>
            
            {isRolling && (
              <div className="text-gray-400 text-sm mt-2 animate-pulse">
                운명이 결정되고 있습니다...
              </div>
            )}
            
            {!isRolling && diceResult && (
              <div className={`text-sm mt-2 font-bold ${diceResult >= 8 ? 'text-green-400' : diceResult >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {diceResult >= 8 && '🍀 행운의 굴림!'}
                {diceResult >= 5 && diceResult < 8 && '⚖️ 평범한 결과'}
                {diceResult < 5 && '💔 불운한 결과'}
              </div>
            )}
          </div>
        )}

        {/* 상태효과 안내 - 개선된 디자인 */}
        <div className="bg-gray-800 rounded-lg p-4 mt-6 border border-gray-600">
          <div className="text-white text-sm space-y-1">
            <div className="font-bold mb-2 flex items-center space-x-2">
              <span>💡</span>
              <span>전투 및 상태효과 정보:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <span>💫</span>
                <span><strong>기절:</strong> 해당 턴에 행동할 수 없음</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🧊</span>
                <span><strong>빙결:</strong> 해당 턴에 행동할 수 없음</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>☠️</span>
                <span><strong>중독:</strong> 매 턴마다 피해를 받음</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔥</span>
                <span><strong>화상:</strong> 지속 피해 효과</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center space-x-2 text-yellow-300">
                <span>⚡</span>
                <span>속성 상성을 활용하여 1.5배 피해를 주세요!</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <span>🎯</span>
                <span>주사위 운이 회피율을 결정합니다 (최대 50%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 전투 진행률 표시 */}
        {player && enemy && (
          <div className="bg-gray-800 rounded-lg p-4 mt-4 border border-gray-600">
            <div className="text-white text-sm font-bold mb-2 text-center">⚔️ 전투 현황</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-green-400 font-bold">플레이어</div>
                <div className="text-white">
                  {Math.round((player.currentHp / player.baseHp) * 100)}% 생존
                </div>
                <div className={`w-full bg-gray-700 rounded-full h-2 mt-1 ${combatPhase === 'critical' && player.currentHp / player.baseHp <= 0.2 ? 'animate-health-pulse' : ''}`}>
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(player.currentHp / player.baseHp) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-red-400 font-bold">적</div>
                <div className="text-white">
                  {Math.round((enemy.currentHp / enemy.hp) * 100)}% 생존
                </div>
                <div className={`w-full bg-gray-700 rounded-full h-2 mt-1 ${combatPhase === 'critical' && enemy.currentHp / enemy.hp <= 0.2 ? 'animate-health-pulse' : ''}`}>
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(enemy.currentHp / enemy.hp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 배경 전투 파티클 */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {combatPhase === 'critical' && (
            <>
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-400 rounded-full opacity-60 animate-float-particles"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;