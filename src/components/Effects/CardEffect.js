import React, { useState, useEffect } from 'react';

const CardEffect = ({ 
  effectType = 'attack', 
  position = { x: 0, y: 0 },
  duration = 1000,
  onComplete,
  intensity = 'normal', // 'weak', 'normal', 'strong', 'critical'
  element = 'none' // 'fire', 'water', 'grass', 'none'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // 파티클 생성
    const newParticles = Array.from({ length: getParticleCount() }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * getParticleSpread(),
      y: (Math.random() - 0.5) * getParticleSpread(),
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 200,
      velocity: 0.5 + Math.random() * 1.5
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const getParticleCount = () => {
    const baseCount = {
      attack: 8,
      magic: 12,
      heal: 6,
      critical: 15,
      shield: 5,
      poison: 10,
      freeze: 8,
      burn: 12
    }[effectType] || 8;

    const intensityMultiplier = {
      weak: 0.5,
      normal: 1,
      strong: 1.5,
      critical: 2
    }[intensity] || 1;

    return Math.floor(baseCount * intensityMultiplier);
  };

  const getParticleSpread = () => {
    return {
      weak: 60,
      normal: 100,
      strong: 140,
      critical: 200
    }[intensity] || 100;
  };

  const getEffectIcon = () => {
    const icons = {
      attack: '⚔️',
      magic: '✨',
      heal: '❤️',
      critical: '💥',
      shield: '🛡️',
      poison: '☠️',
      freeze: '🧊',
      burn: '🔥',
      multi_hit: '💢'
    };
    return icons[effectType] || '✨';
  };

  const getElementalIcon = () => {
    const elementIcons = {
      fire: '🔥',
      water: '💧',
      grass: '🌿',
      none: ''
    };
    return elementIcons[element] || '';
  };

  const getEffectColor = () => {
    if (element !== 'none') {
      return {
        fire: 'text-red-400',
        water: 'text-blue-400',
        grass: 'text-green-400'
      }[element] || 'text-white';
    }

    return {
      attack: 'text-red-400',
      magic: 'text-purple-400',
      heal: 'text-green-400',
      critical: 'text-yellow-400',
      shield: 'text-blue-400',
      poison: 'text-purple-500',
      freeze: 'text-cyan-400',
      burn: 'text-orange-400'
    }[effectType] || 'text-white';
  };

  const getMainIconSize = () => {
    return {
      weak: 'text-4xl',
      normal: 'text-6xl',
      strong: 'text-8xl',
      critical: 'text-10xl'
    }[intensity] || 'text-6xl';
  };

  const getRingColor = () => {
    if (element !== 'none') {
      return {
        fire: 'bg-red-400',
        water: 'bg-blue-400',
        grass: 'bg-green-400'
      }[element] || 'bg-white';
    }

    return {
      attack: 'bg-red-400',
      magic: 'bg-purple-400',
      heal: 'bg-green-400',
      critical: 'bg-yellow-400',
      shield: 'bg-blue-400',
      poison: 'bg-purple-500',
      freeze: 'bg-cyan-400',
      burn: 'bg-orange-400'
    }[effectType] || 'bg-white';
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-40"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* 중앙 이펙트 */}
      <div className={`
        relative ${getMainIconSize()} ${getEffectColor()}
        animate-card-effect-main drop-shadow-lg
      `}>
        <div className="relative flex items-center justify-center">
          {getEffectIcon()}
          {getElementalIcon() && (
            <div className="absolute -top-2 -right-2 text-lg">
              {getElementalIcon()}
            </div>
          )}
        </div>
        
        {/* 펄스 링 */}
        <div className="absolute inset-0 animate-ping">
          <div className={`w-full h-full rounded-full opacity-20 ${getRingColor()}`}></div>
        </div>

        {/* 강도별 추가 링 */}
        {(intensity === 'strong' || intensity === 'critical') && (
          <div className="absolute inset-0 animate-ping animation-delay-200">
            <div className={`w-full h-full rounded-full opacity-15 ${getRingColor()}`}></div>
          </div>
        )}
      </div>

      {/* 파티클 이펙트 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`
            absolute text-2xl ${getEffectColor()} opacity-80
            animate-particle-burst
          `}
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${800 + particle.velocity * 200}ms`
          }}
        >
          {getEffectIcon()}
        </div>
      ))}

      {/* 치명타 특별 효과 */}
      {intensity === 'critical' && (
        <>
          <div className="absolute inset-0 animate-spin-slow">
            <div className="text-yellow-300 text-8xl opacity-50">⭐</div>
          </div>
          <div className="absolute inset-0 animate-pulse">
            <div className="text-yellow-400 text-6xl opacity-30">💫</div>
          </div>
        </>
      )}

      {/* 마법 특별 효과 */}
      {effectType === 'magic' && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full animate-magic-sparkle"
              style={{
                left: `${20 + i * 15}%`,
                top: `${20 + (i % 2) * 60}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* 독 특별 효과 */}
      {effectType === 'poison' && (
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-purple-500 rounded-full opacity-60 animate-float-particles"
              style={{
                left: `${25 + i * 25}%`,
                top: `${25 + (i % 2) * 50}%`,
                animationDelay: `${i * 150}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* 힐링 특별 효과 */}
      {effectType === 'heal' && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-300 text-xl animate-fade-in opacity-70"
              style={{
                left: `${30 + i * 20}%`,
                top: `${30 + i * 20}%`,
                animationDelay: `${i * 200}ms`
              }}
            >
              +
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardEffect;