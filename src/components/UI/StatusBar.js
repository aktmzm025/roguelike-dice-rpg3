import React, { useState, useEffect, useRef } from 'react';

const StatusBar = ({ 
  current, 
  max, 
  label, 
  color = 'bg-green-500',
  backgroundColor = 'bg-gray-700',
  textColor = 'text-white',
  showPercentage = false,
  showNumbers = true,
  className = '',
  height = 'h-6',
  animated = true,
  pulseOnLow = true,
  showDamageFlash = true,
  gradientEffect = true
}) => {
  const [displayCurrent, setDisplayCurrent] = useState(current);
  const [isAnimating, setIsAnimating] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [healFlash, setHealFlash] = useState(false);
  const prevCurrentRef = useRef(current);
  const animationRef = useRef(null);

  // 값 변화 감지 및 애니메이션
  useEffect(() => {
    const prevCurrent = prevCurrentRef.current;
    
    if (current !== prevCurrent && animated) {
      setIsAnimating(true);
      
      // 피해/힐링 플래시 효과
      if (showDamageFlash) {
        if (current < prevCurrent) {
          setDamageFlash(true);
          setTimeout(() => setDamageFlash(false), 300);
        } else if (current > prevCurrent) {
          setHealFlash(true);
          setTimeout(() => setHealFlash(false), 300);
        }
      }
      
      // 부드러운 카운팅 애니메이션
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const startValue = displayCurrent;
      const endValue = current;
      const duration = 500; // 0.5초
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutQuart 함수로 부드러운 애니메이션
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
        
        setDisplayCurrent(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else if (!animated) {
      setDisplayCurrent(current);
    }
    
    prevCurrentRef.current = current;
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [current, displayCurrent, animated, showDamageFlash]);

  // 안전한 percentage 계산
  const percentage = Math.max(0, Math.min(100, max > 0 ? (displayCurrent / max) * 100 : 0));
  
  // 체력에 따른 색상 변경 (개선된 버전)
  const getHealthColor = () => {
    if (label?.includes('체력') || label?.includes('HP')) {
      if (percentage >= 70) return 'bg-green-500';
      if (percentage >= 50) return 'bg-yellow-500';
      if (percentage >= 30) return 'bg-orange-500';
      if (percentage >= 15) return 'bg-red-500';
      return 'bg-red-700';
    }
    return color;
  };

  // 그라디언트 효과
  const getGradientColor = () => {
    if (!gradientEffect) return getHealthColor();
    
    if (label?.includes('체력') || label?.includes('HP')) {
      if (percentage >= 70) return 'bg-gradient-to-r from-green-400 to-green-600';
      if (percentage >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      if (percentage >= 30) return 'bg-gradient-to-r from-orange-400 to-orange-600';
      if (percentage >= 15) return 'bg-gradient-to-r from-red-400 to-red-600';
      return 'bg-gradient-to-r from-red-600 to-red-800';
    }
    return color;
  };

  // 텍스트 색상 개선
  const getTextColor = () => {
    if (label?.includes('체력') || label?.includes('HP')) {
      return 'text-white';
    }
    return textColor;
  };

  // 상태 텍스트
  const getHealthStatus = () => {
    if (percentage >= 80) return { text: '건강함', color: 'text-green-300', icon: '💚' };
    if (percentage >= 60) return { text: '양호함', color: 'text-yellow-300', icon: '💛' };
    if (percentage >= 40) return { text: '부상', color: 'text-orange-300', icon: '🧡' };
    if (percentage >= 20) return { text: '위험', color: 'text-red-300', icon: '❤️' };
    if (percentage >= 10) return { text: '치명상', color: 'text-red-400', icon: '💔' };
    return { text: '위급', color: 'text-red-500', icon: '☠️' };
  };

  const finalColor = gradientEffect ? getGradientColor() : getHealthColor();
  const finalTextColor = getTextColor();
  const healthStatus = getHealthStatus();
  const shouldPulse = pulseOnLow && percentage <= 20 && percentage > 0;
  
  return (
    <div className={`${className} ${isAnimating ? 'animate-pulse-once' : ''} ${damageFlash ? 'animate-shake' : ''}`}>
      {/* 상단 라벨과 수치 */}
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-bold ${finalTextColor} flex items-center space-x-1`}>
          <span>{label}</span>
          {(label?.includes('체력') || label?.includes('HP')) && (
            <span className="text-xs animate-pulse">{healthStatus.icon}</span>
          )}
        </span>
        
        {showNumbers && (
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold ${finalTextColor} ${isAnimating ? 'animate-pulse' : ''}`}>
              {displayCurrent}/{max}
              {showPercentage && ` (${Math.round(percentage)}%)`}
            </span>
            
            {/* 상태 표시 */}
            {(label?.includes('체력') || label?.includes('HP')) && (
              <span className={`text-xs font-medium ${healthStatus.color} bg-gray-800 px-2 py-1 rounded animate-fade-in`}>
                {healthStatus.text}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* 메인 상태바 */}
      <div className={`
        w-full ${backgroundColor} rounded-full ${height} border-2 border-gray-600 overflow-hidden relative
        ${damageFlash ? 'ring-2 ring-red-400 animate-flash' : ''}
        ${healFlash ? 'ring-2 ring-green-400 animate-pulse-once' : ''}
      `}>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(255,255,255,0.1) 10%, rgba(255,255,255,0.1) 20%)'
          }}></div>
        </div>
        
        {/* 메인 바 */}
        <div 
          className={`
            ${finalColor} ${height} rounded-full transition-all duration-500 ease-out relative overflow-hidden
            ${shouldPulse ? 'animate-health-pulse' : ''}
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          style={{ 
            width: `${percentage}%`,
            minWidth: percentage > 0 ? '2px' : '0px'
          }}
        >
          {/* 내부 글로우 효과 */}
          <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
          
          {/* 움직이는 하이라이트 효과 */}
          <div className="absolute top-0 left-0 h-2 w-full bg-white opacity-30 rounded-full"></div>
          
          {/* 플로우 애니메이션 */}
          {percentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine"></div>
          )}
          
          {/* 체력바 내부 텍스트 */}
          {height === 'h-8' && percentage > 15 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold drop-shadow-lg">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
          
          {/* 임계점 표시 */}
          {percentage <= 25 && percentage > 0 && (
            <div className="absolute inset-0 bg-red-300 opacity-40 rounded-full animate-pulse"></div>
          )}
        </div>
        
        {/* 임계값 마커들 */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((threshold) => (
            <div
              key={threshold}
              className="absolute top-0 h-full w-0.5 bg-white opacity-30"
              style={{ left: `${threshold}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* 추가 정보 표시 */}
      {(label?.includes('체력') || label?.includes('HP')) && (
        <div className="flex justify-between items-center mt-2">
          <div className="text-center">
            <span className={`text-xs font-medium ${healthStatus.color}`}>
              {percentage.toFixed(1)}%
            </span>
            {displayCurrent <= 0 && (
              <span className="ml-2 text-red-500 font-bold animate-pulse">💀</span>
            )}
          </div>
          
          {/* 변화량 표시 */}
          {isAnimating && (
            <div className="text-xs text-gray-400 animate-bounce flex items-center space-x-1">
              <span>📊</span>
              <span>변화 중...</span>
            </div>
          )}
          
          {/* 회복/피해 표시 */}
          {healFlash && (
            <div className="text-xs text-green-400 animate-fade-in flex items-center space-x-1">
              <span>❤️</span>
              <span>회복!</span>
            </div>
          )}
          
          {damageFlash && (
            <div className="text-xs text-red-400 animate-fade-in flex items-center space-x-1">
              <span>💥</span>
              <span>피해!</span>
            </div>
          )}
        </div>
      )}
      
      {/* 특수 상태 표시 */}
      {percentage === 100 && (
        <div className="mt-1 text-center">
          <span className="text-xs text-green-400 animate-pulse">✨ 최대치 ✨</span>
        </div>
      )}
      
      {percentage === 0 && (
        <div className="mt-1 text-center">
          <span className="text-xs text-red-500 animate-flash">⚠️ 고갈 ⚠️</span>
        </div>
      )}
    </div>
  );
};

export default StatusBar;