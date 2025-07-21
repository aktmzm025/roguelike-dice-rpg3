import React, { useState, useEffect } from 'react';

const DamageNumber = ({ 
  damage, 
  isHealing = false, 
  isCritical = false,
  isPlayerDamage = false,
  position = { x: 0, y: 0 },
  onComplete,
  type = 'normal' // 'normal', 'poison', 'burn', 'freeze'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('entering');

  useEffect(() => {
    // 애니메이션 시퀀스
    const timer1 = setTimeout(() => {
      setAnimationPhase('floating');
    }, 100);

    const timer2 = setTimeout(() => {
      setAnimationPhase('exiting');
    }, 800);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const getNumberColor = () => {
    if (isHealing) return 'text-green-400';
    if (isPlayerDamage) return 'text-red-400';
    
    switch (type) {
      case 'poison': return 'text-purple-400';
      case 'burn': return 'text-orange-400';
      case 'freeze': return 'text-cyan-400';
      default: return 'text-yellow-400';
    }
  };

  const getNumberSize = () => {
    if (isCritical) return 'text-5xl font-black';
    if (damage >= 15) return 'text-4xl font-bold';
    if (damage >= 10) return 'text-3xl font-bold';
    return 'text-2xl font-semibold';
  };

  const getAnimationClass = () => {
    switch (animationPhase) {
      case 'entering':
        return 'animate-damage-enter';
      case 'floating':
        return 'animate-damage-float';
      case 'exiting':
        return 'animate-damage-exit';
      default:
        return '';
    }
  };

  const getTypeEffect = () => {
    switch (type) {
      case 'poison':
        return 'animate-poison';
      case 'burn':
        return 'animate-burn';
      case 'freeze':
        return 'animate-freeze';
      default:
        return '';
    }
  };

  const getNumberPrefix = () => {
    if (isHealing) return '+';
    return '-';
  };

  const getNumberSuffix = () => {
    if (isCritical) return '!';
    return '';
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'poison': return '☠️';
      case 'burn': return '🔥';
      case 'freeze': return '🧊';
      default: return '';
    }
  };

  return (
    <div
      className={`
        fixed pointer-events-none z-50 font-bold select-none
        ${getNumberColor()} ${getNumberSize()} ${getAnimationClass()} ${getTypeEffect()}
        drop-shadow-lg
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}
    >
      {/* 메인 텍스트 */}
      <div className="relative flex items-center justify-center space-x-1">
        {/* 타입 아이콘 */}
        {getTypeIcon() && (
          <span className="text-lg opacity-80">
            {getTypeIcon()}
          </span>
        )}
        
        {/* 피해량 텍스트 */}
        <div className="relative">
          {/* 배경 그림자 효과 */}
          <div className="absolute inset-0 text-black opacity-50 blur-sm">
            {getNumberPrefix()}{damage}{getNumberSuffix()}
          </div>
          
          {/* 메인 텍스트 */}
          <div className="relative">
            {getNumberPrefix()}{damage}{getNumberSuffix()}
          </div>
        </div>
      </div>

      {/* 치명타 특수 효과 */}
      {isCritical && (
        <>
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full bg-yellow-400 rounded-full opacity-30"></div>
          </div>
          <div className="absolute -top-2 -right-2 text-yellow-300 text-lg animate-spin-slow">
            ⭐
          </div>
        </>
      )}

      {/* 힐링 특수 효과 */}
      {isHealing && (
        <div className="absolute -top-1 -right-1 text-green-300 text-sm animate-pulse">
          ✨
        </div>
      )}

      {/* 연속 공격 표시 */}
      {damage > 20 && !isCritical && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white bg-red-600 px-2 py-1 rounded-full animate-pulse">
          COMBO!
        </div>
      )}
    </div>
  );
};

export default DamageNumber;