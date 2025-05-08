import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import html2canvas from 'html2canvas';

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
  * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #000;
    perspective: 1000px;
  }

  @media (min-width: 480px) {
    body {
      background-color: #fff;
    }
  }
`;

// 애니메이션 키프레임 정의
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

// CSS 애니메이션 완료 상태를 적용하는 전역 스타일
const CaptureStyles = createGlobalStyle<{ forCapture: boolean }>`
  ${props => props.forCapture && `
    body {
      background-color: #000;
    }
  `}
`;

// 화면 크기에 따른 스타일을 정의하는 미디어 쿼리
const responsiveStyles = {
  extraSmall: {
    labelSize: '9px',
    valueSize: '10px',
    circleSize: '16px',
    maxWidth: '70px',
  },
  small: {
    labelSize: '10px',
    valueSize: '12px',
    circleSize: '20px',
    maxWidth: '90px',
  },
  medium: {
    labelSize: '12px',
    valueSize: '14px',
    circleSize: '24px',
    maxWidth: '110px',
  },
  large: {
    labelSize: '14px', 
    valueSize: '16px',
    circleSize: '30px',
    maxWidth: '130px',
  }
};

// FaceFeatures 인터페이스 직접 정의 
interface FaceFeatures {
  faceRatio: number;
  symmetryScore: number;
  foreheadNoseChinRatio: number;
  eyeWidth_L: number;
  eyeWidth_R: number;
  eyeSeparation: number;
  eyeAngle_L: number;
  eyeAngle_R: number;
  eyeAngleDeg_L: number;
  eyeAngleDeg_R: number;
  noseLength: number;
  noseHeight: number;
  nostrilSize_L: number;
  nostrilSize_R: number;
  mouthWidth: number;
  mouthHeight: number;
  mouthCurve: number;
  lipThickness: number;
  lowerLipThickness: number;
  skinTone: number;
  wrinkleScore: number;
  faceRegionAnalysis: number;
  eyeDistance: number;
  eyeDistanceRatio: number;
  eyeIrisColor_L: string;
  eyeIrisColor_R: string;
  eyeDarkCircleColor: string;
  skinToneColor: string;
  faceWidthPixels?: number;
  [key: string]: number | string | undefined;
}

// 그라데이션을 위한 8가지 색상 정의
const gradientColors = [
  { name: 'deepBlue', value: '30, 50, 80' },
  { name: 'purple', value: '70, 30, 90' },
  { name: 'teal', value: '20, 80, 80' },
  { name: 'burgundy', value: '80, 20, 40' },
  { name: 'forestGreen', value: '30, 70, 30' },
  { name: 'darkNavy', value: '20, 30, 60' },
  { name: 'maroon', value: '90, 20, 30' },
  { name: 'slate', value: '50, 60, 70' }
];

interface ResultCardProps {
  result: FaceFeatures | null;
  onRetake: () => void;
  onSave: () => void;
  userName?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  min-height: 100vh;
  min-height: -webkit-fill-available; // iOS Safari를 위한 설정
  background-color: #fff;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  box-sizing: border-box;
  padding: 30px 15px;
  padding-bottom: calc(env(safe-area-inset-bottom) + 30px); // iOS Safari 하단 영역 고려
  perspective: 1000px;

  @media (min-width: 480px) {
    position: static;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 50px 0;
    background-color: #fff;
  }
`;

const CardWrapper = styled.div<{ isFlipped: boolean; isVisible: boolean }>`
  width: 90%;
  max-width: 380px;
  height: calc(90vh - 60px); // 버튼과 푸터 공간만 확보하도록 수정
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  background-color: transparent;
  margin: auto;
  overflow: hidden;
  transition: transform 0.8s, opacity 0.6s ease;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped 
    ? 'rotateY(180deg) translateZ(20px)' 
    : props.isVisible 
      ? 'rotateY(0) translateZ(0)' 
      : 'rotateY(0) translateZ(0)'};
  opacity: ${props => props.isVisible ? 1 : 0};
  cursor: ${props => props.isVisible ? 'pointer' : 'default'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    pointer-events: none;
    opacity: ${props => props.isFlipped ? 0 : 1};
    transition: opacity 0.4s ease;
  }

  @media (min-width: 480px) {
    width: 480px;
    height: 800px;
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    background-color: transparent;
    margin: auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const GradientOverlay = styled.div<{ color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: ${props => `linear-gradient(to top, rgba(${props.color}, 0.3) 0%, rgba(${props.color}, 0.1) 60%, rgba(${props.color}, 0) 100%)`};
  z-index: 15;
  pointer-events: none;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const CardFront = styled.div<{ isFlipped: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: opacity 0.3s ease-in-out ${props => props.isFlipped ? '0s' : '0.3s'};
  opacity: ${props => props.isFlipped ? 0 : 1};
  transform: translateZ(0);
  class-name: card-front;
  background-color: #000;
  border-radius: 20px;
`;

const CardBack = styled.div<{ isFlipped: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: rotateY(180deg) translateZ(0);
  background-color: transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #9F9F9F;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.isFlipped ? 1 : 0};
  class-name: card-back;
  z-index: 20;
  transform-style: preserve-3d;
`;

const CardBackContent = styled.div`
  text-align: center;
  max-width: 80%;
  width: 100%;
  z-index: 25;
  transform: scaleX(-1);
`;

const CardBackTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 700;
  color: #797979;
  transform: scaleX(-1);
`;

const CardBackDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
  color: #797979;
  transform: scaleX(-1);
`;

const FullScreenCard = styled.div`
  flex: 1;
  position: relative;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  box-sizing: border-box;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
`;

const FaceContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FaceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 1;
`;

// 각 항목들의 배치를 위한 스타일 컴포넌트
const DataItem = styled.div<{ 
  top?: string, 
  left?: string, 
  right?: string, 
  bottom?: string, 
  textAlign?: string,
  screenSize: 'extraSmall' | 'small' | 'medium' | 'large'
}>`
  position: absolute;
  top: ${props => props.top || 'auto'};
  left: ${props => props.left || 'auto'};
  right: ${props => props.right || 'auto'};
  bottom: ${props => props.bottom || 'auto'};
  display: flex;
  flex-direction: column;
  align-items: ${props => props.textAlign === 'left' ? 'flex-start' : props.textAlign === 'right' ? 'flex-end' : 'center'};
  z-index: 15;
  max-width: ${props => responsiveStyles[props.screenSize].maxWidth};
  transition: font-size 0.2s ease;
`;

const DataLabel = styled.span<{ screenSize: 'extraSmall' | 'small' | 'medium' | 'large' }>`
  font-size: ${props => responsiveStyles[props.screenSize].labelSize};
  color: #9F9F9F;
  margin-bottom: 2px;
  font-weight: 500;
  white-space: nowrap;
`;

const DataValue = styled.span<{ screenSize: 'extraSmall' | 'small' | 'medium' | 'large' }>`
  font-size: ${props => responsiveStyles[props.screenSize].valueSize};
  color: #797979;
  font-weight: 700;
`;

const ColorCircle = styled.div<{ color: string, screenSize: 'extraSmall' | 'small' | 'medium' | 'large' }>`
  width: ${props => responsiveStyles[props.screenSize].circleSize};
  height: ${props => responsiveStyles[props.screenSize].circleSize};
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-top: 2px;
`;

const ButtonsContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  gap: 16px;
  margin: 20px auto;
  width: 100%;
  justify-content: center;
  z-index: 20;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom); // iOS Safari 하단 영역 고려
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: rgba(210, 210, 210, 0.7);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 40px;
  height: 40px;
  font-family: 'Pretendard', sans-serif;

  &:hover {
    background-color: #555555;
  }

  & img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
`;

const InterpretText = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 280px;
  text-align: center;
  color: #797979;
  font-size: 20px;
  font-weight: 600;
  z-index: 25;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
`;

const Footer = styled.div<{ isVisible?: boolean }>`
  margin-top: 10px;
  text-align: center;
  width: 100%;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  z-index: 20;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom); // iOS Safari 하단 영역 고려
`;

const Copyright = styled.div`
  color: #999;
  font-size: 9px;
  font-family: 'Pretendard', sans-serif;
`;

const CardLogo = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 20;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
`;

// 디바운스 함수 추가
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onRetake, onSave, userName = '진원' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [screenSize, setScreenSize] = useState<'extraSmall' | 'small' | 'medium' | 'large'>('medium');
  const [forCapture, setForCapture] = useState(false);
  const [gradientColor, setGradientColor] = useState('30, 30, 30');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showBackContent, setShowBackContent] = useState(false);
  const [contentTransitioning, setContentTransitioning] = useState(false);
  
  // 랜딩 애니메이션 상태
  const [animationState, setAnimationState] = useState({
    logoVisible: false,
    cardVisible: false,
    titleVisible: false,
    buttonsVisible: false,
    footerVisible: false
  });
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // 컴포넌트 마운트 시 랜덤 색상 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gradientColors.length);
    setGradientColor(gradientColors[randomIndex].value);
    
    // 랜딩 애니메이션 시작
    setTimeout(() => setAnimationState(prev => ({ ...prev, logoVisible: true })), 100);
    setTimeout(() => setAnimationState(prev => ({ ...prev, cardVisible: true })), 500); // 0.4초 후
    setTimeout(() => setAnimationState(prev => ({ ...prev, titleVisible: true })), 900); // 0.8초 후
    setTimeout(() => {
      setAnimationState(prev => ({ ...prev, buttonsVisible: true }));
      // 모든 애니메이션 완료 후 상호작용 활성화
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, footerVisible: true }));
        setAnimationComplete(true);
      }, 400);
    }, 1300); // 1.2초 후
  }, []);
  
  // 화면 크기에 따라 텍스트 크기 조정 - 최적화된 버전
  const handleResize = useCallback(debounce(() => {
    if (window.innerWidth < 360) {
      setScreenSize('extraSmall');
    } else if (window.innerWidth < 480) {
      setScreenSize('small');
    } else {
      setScreenSize('medium');
    }
  }, 100), []);
  
  useEffect(() => {
    // 초기 화면 크기 설정
    handleResize();
    
    // window resize 이벤트 추가
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  // body 스타일 설정을 위한 부수 효과
  React.useEffect(() => {
    // 원래 스타일 저장
    const originalStyle = document.body.style.cssText;
    
    // body에 스타일 적용
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#fff';
    
    // 컴포넌트 언마운트 시 복원
    return () => {
      document.body.style.cssText = originalStyle;
    };
  }, []);
  
  // 화면 캡처 함수 구현
  const captureScreen = () => {
    // 캡처를 위해 상태 설정
    setForCapture(true);
    
    // DOM 업데이트가 완료된 후 캡처 실행
    setTimeout(() => {
      // PC 버전에서는 카드만 캡처하고, 모바일에서는 전체 화면 캡처
      const targetElement = window.innerWidth >= 480 ? cardRef.current : containerRef.current;
      
      if (targetElement) {
        html2canvas(targetElement, {
          scale: 2, // 2배 크기로 저장
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#000",
          logging: true,
        }).then(canvas => {
          // 캔버스를 이미지로 변환
          const image = canvas.toDataURL('image/png');
          
          // 다운로드 링크 생성
          const link = document.createElement('a');
          link.href = image;
          link.download = `관상데이터카드_${userName}_${new Date().toISOString().slice(0, 10)}.png`;
          
          // 다운로드 링크 클릭
          link.click();
          
          // 캡처 모드 해제
          setForCapture(false);
          
          // 원래 동작 수행
          onSave();
        }).catch(error => {
          console.error("캡처 오류:", error);
          setForCapture(false);
        });
      }
    }, 100); // DOM 업데이트를 위한 짧은 지연
  };
  
  // 카드 뒤집기 핸들러
  const handleCardFlip = () => {
    if (contentTransitioning || !animationComplete) return; // 애니메이션 완료 전이나 전환 중에는 클릭 방지
    
    setContentTransitioning(true);
    
    // 앞면이 보이고 있다면, 먼저 앞면을 숨김
    if (!isFlipped) {
      setShowBackContent(false);
      setTimeout(() => {
        setIsFlipped(true);
        // 카드가 90도 회전한 후에 뒷면 내용 표시
        setTimeout(() => {
          setShowBackContent(true);
          setContentTransitioning(false);
        }, 400); // 회전 애니메이션 중간 지점에서 내용 전환
      }, 100); // 앞면이 사라진 후 카드 회전 시작
    } else {
      // 뒷면이 보이고 있다면, 먼저 뒷면을 숨김
      setShowBackContent(false);
      setTimeout(() => {
        setIsFlipped(false);
        // 카드가 90도 회전한 후에 앞면 내용 표시
        setTimeout(() => {
          setShowBackContent(true);
          setContentTransitioning(false);
        }, 400); // 회전 애니메이션 중간 지점에서 내용 전환
      }, 100); // 뒷면이 사라진 후 카드 회전 시작
    }
  };
  
  if (!result) return null;

  return (
    <>
      <GlobalStyle />
      <CaptureStyles forCapture={forCapture} />
      <Container ref={containerRef}>
        <CardWrapper 
          ref={cardRef} 
          isFlipped={isFlipped} 
          isVisible={animationState.cardVisible}
          onClick={animationComplete ? handleCardFlip : undefined}
        >
          <GradientOverlay color={gradientColor} />
          <CardLogo isVisible={animationState.logoVisible}>
            <img src={`${process.env.PUBLIC_URL}/images/icon/logo-white.png`} alt="관상 로고" style={{ height: '40px', opacity: 0.3}} />
          </CardLogo>
          <CardFront isFlipped={isFlipped} id="card-front">
            {(!isFlipped || showBackContent) && (
              <>
                <FullScreenCard>
                  <FaceContainer>
                    <FaceImage src={`${process.env.PUBLIC_URL}/images/result_face.png`} alt="Face Analysis" />
                    
                    {/* 상단 측정 결과 */}
                    <DataItem top="12%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>얼굴 너비-높이 비율</DataLabel>
                      <DataValue screenSize={screenSize}>{(result.faceRatio * 0.4 + 0.5).toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 왼쪽 상단 */}
                    <DataItem top="33%" left="15%" textAlign="left" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>왼쪽 눈 색상</DataLabel>
                      <ColorCircle color={result.eyeIrisColor_L || '#130603'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                    
                    {/* 오른쪽 상단 */}
                    <DataItem top="33%" right="15%" textAlign="right" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>오른쪽 눈 색상</DataLabel>
                      <ColorCircle color={result.eyeIrisColor_R || '#190705'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                    
                    {/* 얼굴 대칭성 */}
                    <DataItem top="20%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>얼굴 대칭성</DataLabel>
                      <DataValue screenSize={screenSize}>{(result.symmetryScore * 100).toFixed(0)}%</DataValue>
                    </DataItem>
                    
                    {/* 왼쪽 중앙 */}
                    <DataItem top="27%" left="12%" textAlign="left" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>왼쪽 눈 기울기</DataLabel>
                      <DataValue screenSize={screenSize}>{result.eyeAngleDeg_L.toFixed(1)}°</DataValue>
                    </DataItem>
                    
                    {/* 오른쪽 중앙 */}
                    <DataItem top="27%" right="12%" textAlign="right" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>오른쪽 눈 기울기</DataLabel>
                      <DataValue screenSize={screenSize}>{result.eyeAngleDeg_R.toFixed(1)}°</DataValue>
                    </DataItem>
                    
                    {/* 눈 사이 거리 */}
                    <DataItem top="27%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>눈 사이 거리</DataLabel>
                      <DataValue screenSize={screenSize}>{result.eyeDistanceRatio.toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 코 길이 */}
                    <DataItem top="33%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>코 길이</DataLabel>
                      <DataValue screenSize={screenSize}>{result.noseLength.toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 코 높이 */}
                    <DataItem top="40%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>코 높이</DataLabel>
                      <DataValue screenSize={screenSize}>{result.noseHeight.toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 왼쪽 콧망울 */}
                    <DataItem top="40%" left="20%" textAlign="left" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>왼쪽 콧망울 크기</DataLabel>
                      <DataValue screenSize={screenSize}>{result.nostrilSize_L.toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 오른쪽 콧망울 */}
                    <DataItem top="40%" right="20%" textAlign="right" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>오른쪽 콧망울 크기</DataLabel>
                      <DataValue screenSize={screenSize}>{result.nostrilSize_R.toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 아랫입술 두께 */}
                    <DataItem top="50%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>아랫입술 두께</DataLabel>
                      <DataValue screenSize={screenSize}>{result.lowerLipThickness.toFixed(2)}</DataValue>
                    </DataItem>
                    
                    {/* 피부 색상 */}
                    <DataItem bottom="40%" left="25%" textAlign="center" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>피부 색상</DataLabel>
                      <ColorCircle color={result.skinToneColor || '#c6b7b0'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                    
                    {/* 다크서클 색상 */}
                    <DataItem bottom="40%" right="25%" textAlign="center" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>다크서클 색상</DataLabel>
                      <ColorCircle color={result.eyeDarkCircleColor || '#807673'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                  </FaceContainer>
                </FullScreenCard>
                
                <InterpretText isVisible={animationState.titleVisible}>
                  AI_title
                </InterpretText>
              </>
            )}
          </CardFront>
          
          <CardBack isFlipped={isFlipped} id="card-back">
            <CardBackContent>
              <CardBackTitle>관상 분석 결과</CardBackTitle>
              <CardBackDescription>
                AI_description
              </CardBackDescription>
            </CardBackContent>
          </CardBack>
        </CardWrapper>
        
        <ButtonsContainer isVisible={animationState.buttonsVisible}>
          <Button onClick={onRetake}>
            <img src={`${process.env.PUBLIC_URL}/images/icon/retake.png`} alt="다시 찍기" />
          </Button>
          <Button onClick={animationComplete ? handleCardFlip : undefined}>
            <img src={`${process.env.PUBLIC_URL}/images/icon/flip.png`} alt="카드 뒤집기" />
          </Button>
        </ButtonsContainer>

        <Footer isVisible={animationState.footerVisible}>
          <Copyright>© 2025 eeezeen. All rights reserved.</Copyright>
        </Footer>
      </Container>
    </>
  );
};

export default ResultCard; 