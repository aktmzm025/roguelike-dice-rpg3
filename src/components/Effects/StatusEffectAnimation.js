import React, { useState, useEffect } from 'react';

const StatusEffectAnimation = ({ 
  statusEffects = {},
  position = { x: 0, y: 0 },
  isPlayer = true,
  className = ''
}) => {
  const [visibleEffects, setVisibleEffects] = useState([]);

  useEffect(() => {
    const effects = [];
    
    Object.entries(statusEffects).forEach(([effect, duration]) => {
      if (duration > 0) {
        effects.push({
          type: effect,
          duration,
          id: `${effect}-${Date.now()}`
        });
      }
    });
    
    setVisibleEffects(effects);
  }, [statusEffects]);

  const getEffectConfig = (effectType) => {
    const configs = {
      poison: {
        icon: '☠️',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500',
        animation: 'animate-poison',
        name: '중독',
        particles: '💜'
      },
      burn: {
        icon: '🔥',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500',
        animation: 'animate-burn',
        name: '화상',
        particles: '🧡'
      },
      freeze: {
        icon: '🧊',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500',
        animation: 'animate-freeze',
        name: '빙결',
        particles: '💙'
      },
      stun: {
        icon: '💫',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500',
        animation: 'animate-pulse',
        name: '기절',
        particles: '⭐'
      },
      shield: {
        icon: '🛡️',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500',
        animation: 'animate-pulse',
        name: '보호막',
        particles: '💙'
      },
      regen: {
        icon: '❤️',
        color: 'text-green-400',
        bgColor: 'bg-green-500',
        animation: 'animate-pulse',
        name: '재생',
        particles: '💚'
      },
      buff: {
        icon: '⬆️',
        color: 'text-green-400',
        bgColor: 'bg-green-500',
        animation: 'animate-pulse',
        name: '강화',
        particles: '✨'
      },
      debuff: {
        icon: '⬇️',
        color: 'text-red-400',
        bgColor: 'bg-red-500',
        animation: 'animate-pulse',
        name: '약화',
        particles: '💔'
      }
    };
    
    return configs[effectType] || {
      icon: '❓',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500',
      animation: 'animate-pulse',
      name: '알 수 없음',
      particles: '❓'
    };
  };

  const getIntensityClass = (duration) => {
    if (duration >= 3) return 'opacity-100';
    if (duration >= 2) return 'opacity-80';
    return 'opacity-60';
  };

  if (visibleEffects.length === 0) return null;

  return (
    <div 
      className={`fixed pointer-events-none z-30 ${className}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {visibleEffects.map((effect, index) => {
          const config = getEffectConfig(effect.type);
          
          return (
            <div
              key={effect.id}
              className={`
                relative flex items-center space-x-1 px-2 py-1 rounded-full
                ${config.bgColor} ${config.color} ${config.animation}
                ${getIntensityClass(effect.duration)}
                text-xs font-bold
                shadow-lg transform-gpu
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* 아이콘 */}
              <span className="text-sm">{config.icon}</span>
              
              {/* 지속시간 */}
              <span className="text-white text-xs">
                {effect.duration}
              </span>

              {/* 파티클 효과 */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      absolute w-1 h-1 rounded-full opacity-60
                      ${config.bgColor.replace('bg-', 'bg-opacity-80 bg-')}
                      animate-float-particles
                    `}
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${-10 + i * 10}%`,
                      animationDelay: `${i * 200}ms`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>

              {/* 특별 효과 */}
              {effect.type === 'poison' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-300 rounded-full animate-ping opacity-75" />
              )}
              
              {effect.type === 'burn' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-300 rounded-full animate-pulse opacity-75" />
              )}
              
              {effect.type === 'freeze' && (
                <div className="absolute inset-0 border border-cyan-300 rounded-full animate-pulse opacity-50" />
              )}
            </div>
          );
        })}
      </div>

      {/* 전체 상태 효과 수가 많을 때 집계 표시 */}
      {visibleEffects.length > 3 && (
        <div className="mt-2 text-center">
          <div className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold opacity-80">
            +{visibleEffects.length - 3}개 효과
          </div>
        </div>
      )}

      {/* 긍정적/부정적 효과 구분 표시 */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        {visibleEffects.some(e => ['poison', 'burn', 'freeze', 'stun', 'debuff'].includes(e.type)) && (
          <div className="text-red-400 text-xs animate-pulse">⚠️</div>
        )}
        {visibleEffects.some(e => ['shield', 'regen', 'buff'].includes(e.type)) && (
          <div className="text-green-400 text-xs animate-pulse">✨</div>
        )}
      </div>
    </div>
  );
};

export default StatusEffectAnimation;