import React, { useRef, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

interface OnboardingProps {
  onStart: (userName?: string) => void;
}

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
  * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
`;

// AnalysisButton과 동일한 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 블러박스 내용 fade in/out 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Start/Next/Agree 버튼 스타일 (AnalysisButton과 동일)
const ActionButton = styled.div`
  position: absolute;
  bottom: 300px;
  left: calc(50% - 125px);
  transform: translateX(-50%);
  width: 250px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: white;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  opacity: 1;
  visibility: visible;
  animation: ${fadeInUp} 0.5s ease-out forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;
  pointer-events: auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  
  &:active {
    transform: translateX(-50%) scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

// 이름 입력/카메라 권한 블러 박스
const OverlayBox = styled.div`
  position: absolute;
  bottom: 380px;
  left: calc(50% - 125px);
  transform: translateX(-50%);
  width: 250px;
  height: 120px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: ${fadeInUp} 0.3s ease-out forwards;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 블러박스 내용 컨테이너 (fade in/out 애니메이션용)
const OverlayContent = styled.div<{ isVisible: boolean; isAnimating: boolean }>`
  opacity: ${props => props.isVisible ? 1 : 0};
  animation: ${props => props.isAnimating ? (props.isVisible ? fadeIn : fadeOut) : 'none'} 0.6s ease-out forwards;
  width: 100%;
`;

// 이름 입력 제목
const NameInputTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: #333;
`;

// 이름 입력 텍스트박스
const NameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.7);
  outline: none;
  transition: border-color 0.3s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  
  &:focus {
    border-color: #B0B0B0;
  }
  
  &::placeholder {
    color: #999;
  }
`;

// 카메라 권한 텍스트
const CameraPermissionText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: #333;
  line-height: 1.5;
`;

const Onboarding: React.FC<OnboardingProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 뷰포트 높이 관리
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  // 디바이스 타입 상태 (모바일/데스크톱)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 479);
  
  // 비디오 로딩 상태
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // 온보딩 단계 상태
  const [currentStep, setCurrentStep] = useState<'start' | 'name' | 'camera'>('start');
  const [userName, setUserName] = useState('');
  
  // 애니메이션 상태
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 브라우저 높이 변경시 비디오 크기 조정 함수
  const updateViewportHeight = () => {
    const newHeight = window.innerHeight;
    const newWidth = window.innerWidth;
    console.log('현재 브라우저 크기:', newWidth, 'x', newHeight);
    setViewportHeight(newHeight);
    setViewportWidth(newWidth);
    
    // 모바일 환경인지 확인 (화면 너비가 479px 이하)
    const mobile = window.innerWidth <= 479;
    setIsMobile(mobile);
  };
  
  // 뷰포트 높이 변경 감지 및 적용
  useEffect(() => {
    // 초기 로드 및 크기 변경 시 실행
    updateViewportHeight();
    
    const handleResize = () => {
      updateViewportHeight();
    };
    
    // 모바일 브라우저 주소창 표시/숨김에 따른 높이 변화 감지
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    // iOS Safari에서 방향 변경 시 필요
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 300);
    });
    
    // 페이지 로드 완료 후 한 번 더 업데이트
    window.addEventListener('load', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('load', handleResize);
    };
  }, []);

  // 비디오 로딩 완료 처리
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        console.log('비디오 로딩 완료');
        setVideoLoaded(true);
        // 비디오 재생 시도
        video.play().catch(error => {
          console.log('자동 재생 실패:', error);
        });
      };

      const handleError = (error: any) => {
        console.error('비디오 로딩 에러:', error);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };
    }
  }, []);

  // 단계 전환 함수
  const transitionToNextStep = (nextStep: 'start' | 'name' | 'camera') => {
    setIsAnimating(true);
    setIsContentVisible(false);
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsContentVisible(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }, 600);
  };

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (currentStep === 'start') {
      // Start 버튼 클릭 시 이름 입력 단계로 이동
      transitionToNextStep('name');
    } else if (currentStep === 'name') {
      // Next 버튼 클릭 시 이름이 입력되었으면 카메라 권한 단계로
      if (userName.trim()) {
        transitionToNextStep('camera');
      }
    } else if (currentStep === 'camera') {
      // Agree 버튼 클릭 시 다음 단계로
      onStart(userName);
    }
  };

  // 엔터키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userName.trim() && currentStep === 'name') {
      transitionToNextStep('camera');
    } 
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    switch (currentStep) {
      case 'start': return 'Start';
      case 'name': return 'Next';
      case 'camera': return 'Agree';
      default: return 'Start';
    }
  };

  return (
    <>
      <GlobalStyle />
      <div 
        ref={containerRef} 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#fff', // 배경을 흰색으로 변경
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif"
        }}
      >
        {/* 비디오 컨테이너 */}
        <div 
          style={{ 
            position: 'relative',
            width: isMobile ? '100vw' : '400px',
            height: isMobile ? '100vh' : '800px',
            borderRadius: isMobile ? '0' : '20px',
            overflow: 'hidden',
            boxShadow: isMobile ? 'none' : '0 6px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#000'
            
          }}
        >
          {/* 백그라운드 비디오 */}
          <video 
            ref={videoRef}
            autoPlay 
            loop
            muted
            playsInline
            style={{ 
              transform: 'scaleX(1)',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              zIndex: 1
            }}
            onLoadStart={() => console.log('비디오 로딩 시작')}
            onCanPlay={() => console.log('비디오 재생 가능')}
            onError={(e) => console.error('비디오 에러:', e)}
          >
            <source src={`${process.env.PUBLIC_URL}/videos/background_guansang.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* 로딩 중일 때 표시할 배경 */}
          {!videoLoaded && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '16px',
                zIndex: 2
              }}
            >
              Loading...
            </div>
          )}
          
          {/* 이름 입력/카메라 권한 오버레이 */}
          {(currentStep === 'name' || currentStep === 'camera') && (
            <OverlayBox>
              <OverlayContent isVisible={isContentVisible} isAnimating={isAnimating}>
                {currentStep === 'name' && (
                  <>
                    <NameInputTitle>What is your name?</NameInputTitle>
                    <NameInput
                      type="text"
                      placeholder="Your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                  </>
                )}
                {currentStep === 'camera' && (
                  <CameraPermissionText>
                    얼굴 이미지를 저장하지 않아요. <br />카메라 접근 권한을 허용해주세요.
                  </CameraPermissionText>
                )}
              </OverlayContent>
            </OverlayBox>
          )}
          
          {/* Start/Next/Agree 버튼 - 컨테이너 중앙에 위치 */}
          <ActionButton onClick={handleButtonClick}>
            {getButtonText()}
          </ActionButton>
        </div>
      </div>
    </>
  );
};

export default Onboarding; 