// Effects 컴포넌트들을 통합 export
export { default as DamageNumber } from './DamageNumber';
export { default as CardEffect } from './CardEffect';
export { default as StatusEffectAnimation } from './StatusEffectAnimation';
export { default as DiceRollAnimation } from './DiceRollAnimation';

// 각 컴포넌트의 타입 상수들도 export
export const DAMAGE_TYPES = {
  NORMAL: 'normal',
  POISON: 'poison',
  BURN: 'burn',
  FREEZE: 'freeze',
  HEAL: 'heal'
};

export const EFFECT_TYPES = {
  ATTACK: 'attack',
  MAGIC: 'magic',
  HEAL: 'heal',
  CRITICAL: 'critical',
  SHIELD: 'shield',
  POISON: 'poison',
  FREEZE: 'freeze',
  BURN: 'burn',
  MULTI_HIT: 'multi_hit'
};

export const EFFECT_INTENSITY = {
  WEAK: 'weak',
  NORMAL: 'normal',
  STRONG: 'strong',
  CRITICAL: 'critical'
};

export const STATUS_EFFECTS = {
  POISON: 'poison',
  BURN: 'burn',
  FREEZE: 'freeze',
  STUN: 'stun',
  SHIELD: 'shield',
  REGEN: 'regen',
  BUFF: 'buff',
  DEBUFF: 'debuff'
};

// 유틸리티 함수들
export const getEffectIntensityFromDamage = (damage) => {
  if (damage >= 20) return EFFECT_INTENSITY.CRITICAL;
  if (damage >= 15) return EFFECT_INTENSITY.STRONG;
  if (damage >= 8) return EFFECT_INTENSITY.NORMAL;
  return EFFECT_INTENSITY.WEAK;
};

export const getRandomEffectPosition = (centerX = 0, centerY = 0, spread = 50) => {
  return {
    x: centerX + (Math.random() - 0.5) * spread,
    y: centerY + (Math.random() - 0.5) * spread
  };
};

// 이펙트 매니저 클래스
export class EffectManager {
  constructor() {
    this.activeEffects = new Map();
    this.effectQueue = [];
  }

  addEffect(id, effectData) {
    this.activeEffects.set(id, {
      ...effectData,
      timestamp: Date.now()
    });
  }

  removeEffect(id) {
    this.activeEffects.delete(id);
  }

  getActiveEffects() {
    return Array.from(this.activeEffects.values());
  }

  clearExpiredEffects(maxAge = 5000) {
    const now = Date.now();
    for (const [id, effect] of this.activeEffects.entries()) {
      if (now - effect.timestamp > maxAge) {
        this.removeEffect(id);
      }
    }
  }

  queueEffect(effectData) {
    this.effectQueue.push({
      ...effectData,
      id: Date.now() + Math.random()
    });
  }

  processQueue() {
    if (this.effectQueue.length > 0) {
      return this.effectQueue.shift();
    }
    return null;
  }
}