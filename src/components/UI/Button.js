import React, { useState } from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  animationType = 'hover',
  icon = null,
  loading = false,
  glowEffect = false
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    setIsClicked(true);
    
    // 리플 이펙트 생성
    if (animationType === 'ripple' || animationType === 'all') {
      const rect = e.currentTarget.getBoundingClientRect();
      const ripple = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      setRipples(prev => [...prev, ripple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 600);
    }

    setTimeout(() => setIsClicked(false), 150);
    
    if (onClick) onClick(e);
  };

  const baseClasses = 'font-bold rounded transition-all duration-200 relative overflow-hidden select-none transform-gpu';

  const variants = {
    primary: `
      bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white
      hover:shadow-lg hover:shadow-blue-500/30
      active:scale-95 active:shadow-inner
      ${glowEffect ? 'hover:animate-glow' : ''}
    `,
    secondary: `
      bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-600
      hover:shadow-lg hover:shadow-gray-500/30
      active:scale-95
    `,
    success: `
      bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white
      hover:shadow-lg hover:shadow-green-500/30
      active:scale-95
    `,
    danger: `
      bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white
      hover:shadow-lg hover:shadow-red-500/30
      active:scale-95
      ${animationType === 'danger' || animationType === 'all' ? 'hover:animate-shake' : ''}
    `,
    warning: `
      bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black
      hover:shadow-lg hover:shadow-yellow-500/30
      active:scale-95
    `,
    magic: `
      bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
      disabled:bg-gray-600 text-white
      hover:shadow-lg hover:shadow-purple-500/30
      active:scale-95
    `,
    legendary: `
      bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 hover:from-yellow-500 hover:via-red-600 hover:to-pink-600
      disabled:bg-gray-600 text-white font-black
      hover:shadow-lg hover:shadow-yellow-500/50
      active:scale-95 animate-shine
    `
  };

  const sizes = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
    xl: 'py-4 px-8 text-xl',
    xxl: 'py-6 px-12 text-2xl'
  };

  const getAnimationClass = () => {
    if (disabled || loading) return '';
    
    switch (animationType) {
      case 'bounce':
        return 'hover:animate-bounce';
      case 'pulse':
        return 'hover:animate-pulse';
      case 'wiggle':
        return 'hover:animate-wiggle';
      case 'glow':
        return 'hover:animate-glow';
      case 'shake':
        return 'hover:animate-shake';
      default:
        return '';
    }
  };

  const finalClasses = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${getAnimationClass()}
    ${isClicked ? 'transform scale-95' : ''}
    ${className}
  `;

  return (
    <button
      className={finalClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
    >
      {/* 백그라운드 글로우 */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200 rounded"></div>
      
      {/* 리플 이펙트 */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute bg-white rounded-full opacity-30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40
          }}
        />
      ))}

      {/* 콘텐츠 */}
      <div className="relative flex items-center justify-center space-x-2 z-10">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>로딩중...</span>
          </>
        ) : (
          <>
            {icon && (
              <span className={`
                ${animationType === 'bounce' ? 'animate-bounce-delayed' : ''}
                ${variant === 'legendary' ? 'animate-spin-slow' : ''}
              `}>
                {icon}
              </span>
            )}
            <span>{children}</span>
          </>
        )}
      </div>

      {/* 성공 버튼 특별 이펙트 */}
      {variant === 'success' && !disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 animate-shine"></div>
      )}

      {/* 위험 버튼 특별 이펙트 */}
      {variant === 'danger' && !disabled && !loading && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-300 opacity-0 hover:opacity-100 animate-flash"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-300 opacity-0 hover:opacity-100 animate-flash animation-delay-100"></div>
        </div>
      )}

      {/* 마법 버튼 반짝임 */}
      {variant === 'magic' && !disabled && !loading && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-magic-sparkle"
              style={{
                left: `${25 + i * 25}%`,
                top: `${25 + i * 25}%`,
                animationDelay: `${i * 300}ms`
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
};

export default Button;