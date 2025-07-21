import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceRollAnimation = ({ 
  finalValue,
  isRolling,
  onComplete,
  size = 'large', // 'small', 'medium', 'large', 'xlarge'
  glowColor = 'blue' // 'blue', 'red', 'green', 'yellow', 'purple'
}) => {
  const [currentValue, setCurrentValue] = useState(1);
  const [animationPhase, setAnimationPhase] = useState('idle');

  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  useEffect(() => {
    if (isRolling && animationPhase === 'idle') {
      setAnimationPhase('rolling');
      
      // 빠른 롤링 단계
      const fastRolling = setInterval(() => {
        setCurrentValue(Math.floor(Math.random() * 6) + 1);
      }, 80);

      // 2초 후 느린 롤링으로 전환
      setTimeout(() => {
        clearInterval(fastRolling);
        setAnimationPhase('slowing');

        const slowRolling = setInterval(() => {
          setCurrentValue(Math.floor(Math.random() * 6) + 1);
        }, 200);

        // 1초 후 최종 값으로 설정
        setTimeout(() => {
          clearInterval(slowRolling);
          setCurrentValue(Math.min(finalValue, 6)); // 주사위는 최대 6
          setAnimationPhase('result');
          
          // 결과 표시 후 완료 콜백
          setTimeout(() => {
            setAnimationPhase('idle');
            if (onComplete) onComplete();
          }, 1000);
        }, 1000);
      }, 2000);
    }
  }, [isRolling, finalValue, animationPhase, onComplete]);

  const getSizeClasses = () => {
    const sizes = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16',
      large: 'w-24 h-24',
      xlarge: 'w-32 h-32'
    };
    return sizes[size] || sizes.large;
  };

  const getGlowColor = () => {
    const colors = {
      blue: 'shadow-blue-400',
      red: 'shadow-red-400',
      green: 'shadow-green-400',
      yellow: 'shadow-yellow-400',
      purple: 'shadow-purple-400'
    };
    return colors[glowColor] || colors.blue;
  };

  const getAnimationClass = () => {
    switch (animationPhase) {
      case 'rolling':
        return 'animate-dice-roll';
      case 'slowing':
        return 'animate-dice-slow';
      case 'result':
        return 'animate-pulse-once';
      default:
        return '';
    }
  };

  const IconComponent = diceIcons[currentValue - 1] || Dice1;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 주사위 아이콘 */}
      <div 
        className={`
          relative flex items-center justify-center
          ${getSizeClasses()}
          ${getAnimationClass()}
          ${animationPhase === 'result' ? `drop-shadow-lg ${getGlowColor()}` : ''}
          transition-all duration-300
        `}
      >
        {/* 배경 글로우 효과 */}
        {animationPhase !== 'idle' && (
          <div className={`
            absolute inset-0 rounded-lg opacity-30
            ${glowColor === 'blue' ? 'bg-blue-400' : ''}
            ${glowColor === 'red' ? 'bg-red-400' : ''}
            ${glowColor === 'green' ? 'bg-green-400' : ''}
            ${glowColor === 'yellow' ? 'bg-yellow-400' : ''}
            ${glowColor === 'purple' ? 'bg-purple-400' : ''}
            animate-pulse
          `} />
        )}

        {/* 주사위 아이콘 */}
        <IconComponent 
          className={`
            relative z-10 text-white
            ${size === 'small' ? 'w-8 h-8' : ''}
            ${size === 'medium' ? 'w-12 h-12' : ''}
            ${size === 'large' ? 'w-16 h-16' : ''}
            ${size === 'xlarge' ? 'w-20 h-20' : ''}
            drop-shadow-md
          `}
        />

        {/* 특수 효과 파티클 */}
        {animationPhase === 'result' && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-1 h-1 rounded-full opacity-80
                  ${glowColor === 'blue' ? 'bg-blue-300' : ''}
                  ${glowColor === 'red' ? 'bg-red-300' : ''}
                  ${glowColor === 'green' ? 'bg-green-300' : ''}
                  ${glowColor === 'yellow' ? 'bg-yellow-300' : ''}
                  ${glowColor === 'purple' ? 'bg-purple-300' : ''}
                  animate-particle-burst
                `}
                style={{
                  left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 40}%`,
                  top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 40}%`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* 주사위 값 표시 */}
      <div className="text-center">
        <div className={`
          text-2xl font-bold text-white
          ${animationPhase === 'result' ? 'animate-pulse-once' : ''}
        `}>
          {finalValue > 6 ? (
            <div>
              <div className="text-lg text-gray-300">12면 주사위</div>
              <div>{finalValue}</div>
            </div>
          ) : (
            currentValue
          )}
        </div>
        
        {/* 상태 텍스트 */}
        <div className="text-sm text-gray-400 mt-1">
          {animationPhase === 'rolling' && '굴리는 중...'}
          {animationPhase === 'slowing' && '결정 중...'}
          {animationPhase === 'result' && '결과!'}
          {animationPhase === 'idle' && !isRolling && '대기 중'}
        </div>
      </div>

      {/* 12면 주사위용 추가 표시 */}
      {finalValue > 6 && animationPhase === 'result' && (
        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-fade-in">
          고급 주사위! 🎲✨
        </div>
      )}
    </div>
  );
};

export default DiceRollAnimation;