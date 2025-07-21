import React, { useState, useEffect } from 'react';

const TransitionWrapper = ({ 
  children, 
  gameState, 
  transitionType = 'fade',
  duration = 300,
  showParticles = true,
  customTransition = null 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentContent, setCurrentContent] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (currentContent !== children) {
      setIsTransitioning(true);
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentContent(children);
        setIsVisible(true);
        setIsTransitioning(false);
        
        // 전환 완료 시 파티클 생성
        if (showParticles) {
          generateTransitionParticles();
        }
      }, duration);
    }
  }, [children, currentContent, duration, showParticles]);

  const generateTransitionParticles = () => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 500,
      duration: 1000 + Math.random() * 1000
    }));
    
    setParticles(newParticles);
    
    // 파티클 자동 제거
    setTimeout(() => {
      setParticles([]);
    }, 2000);
  };

  const getTransitionClass = () => {
    if (customTransition) return customTransition;
    
    switch (transitionType) {
      case 'fade':
        return isVisible ? 'animate-fade-in' : 'animate-fade-out';
      case 'slide':
        return isVisible ? 'animate-slide-in-right' : 'animate-slide-out-left';
      case 'scale':
        return isVisible ? 'animate-scale-in' : 'animate-scale-out';
      case 'flip':
        return isVisible ? 'animate-flip-in' : 'animate-flip-out';
      default:
        return isVisible ? 'animate-fade-in' : 'animate-fade-out';
    }
  };

  const getGameStateTransition = () => {
    switch (gameState) {
      case 'combat':
        return 'slide';
      case 'event':
        return 'scale';
      case 'card_reward':
      case 'artifact_select':
        return 'flip';
      case 'skill_inventory':
      case 'artifact_inventory':
        return 'slide';
      default:
        return 'fade';
    }
  };

  const getGameStateParticleColor = () => {
    switch (gameState) {
      case 'combat':
        return 'bg-red-400';
      case 'event':
        return 'bg-blue-400';
      case 'card_reward':
        return 'bg-yellow-400';
      case 'artifact_select':
        return 'bg-purple-400';
      default:
        return 'bg-white';
    }
  };

  const effectiveTransition = customTransition ? transitionType : getGameStateTransition();

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 로딩 오버레이 */}
      {isTransitioning && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 text-center max-w-sm">
            {/* 게임 상태별 로딩 아이콘 */}
            <div className="mb-3">
              {gameState === 'combat' && <div className="text-4xl animate-pulse">⚔️</div>}
              {gameState === 'event' && <div className="text-4xl animate-bounce">🌟</div>}
              {gameState === 'card_reward' && <div className="text-4xl animate-spin-slow">🎴</div>}
              {gameState === 'artifact_select' && <div className="text-4xl animate-glow">✨</div>}
              {!['combat', 'event', 'card_reward', 'artifact_select'].includes(gameState) && (
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              )}
            </div>
            
            <div className="text-white text-sm font-medium">
              {gameState === 'combat' && '전투 준비 중...'}
              {gameState === 'event' && '이벤트 로딩 중...'}
              {gameState === 'card_reward' && '카드 보상 준비 중...'}
              {gameState === 'artifact_select' && '아티펙트 선택지 생성 중...'}
              {!['combat', 'event', 'card_reward', 'artifact_select'].includes(gameState) && '로딩 중...'}
            </div>
            
            {/* 로딩 바 */}
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div 
        className={`
          w-full h-full transition-all duration-${duration}
          ${getTransitionClass()}
        `}
      >
        {currentContent}
      </div>

      {/* 전환 파티클 */}
      {showParticles && particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`
                absolute rounded-full opacity-70 animate-float-particles
                ${getGameStateParticleColor()}
              `}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}ms`,
                animationDuration: `${particle.duration}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* 배경 이펙트 (특정 화면에서) */}
      {(gameState === 'combat' || gameState === 'event') && !isTransitioning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 rounded-full opacity-30
                ${gameState === 'combat' ? 'bg-red-400' : 'bg-blue-400'}
                animate-float-particles
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 특별 전환 효과 */}
      {effectiveTransition === 'flip' && isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 z-10" />
      )}
      
      {effectiveTransition === 'scale' && isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 z-10" />
      )}
    </div>
  );
};

export default TransitionWrapper;