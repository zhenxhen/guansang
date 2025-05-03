import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
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
  }

  @media (min-width: 480px) {
    body {
      background-color: #fff;
    }
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
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  padding: 0;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 480px) {
    position: static;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 20px 0;
    background-color: #fff;
  }
`;

const Header = styled.div`
  text-align: center;
  z-index: 20;
  padding: 15px 0 10px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const CardWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  @media (min-width: 480px) {
    width: 480px;
    height: 800px;
    border-radius: 20px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    background-color: #000;
    margin: auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
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

  @media (min-width: 480px) {
    border-radius: 20px;
  }
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
  z-index: 2;
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

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  justify-content: center;
  z-index: 20;

  @media (min-width: 480px) {
    position: absolute;
    bottom: 30px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: rgba(210, 210, 210, 0.7);
  color: white;
  border: none;
  border-radius: 15px;
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

const InterpretButton = styled.button`
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 250px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 20;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  @media (min-width: 480px) {
    position: absolute;
    bottom: 80px;
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  width: 100%;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  z-index: 20;

  @media (min-width: 480px) {
    position: absolute;
    bottom: 10px;
  }
`;

const Copyright = styled.div`
  color: #999;
  font-size: 9px;
  font-family: 'Pretendard', sans-serif;
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
  
  // 화면 크기에 따라 텍스트 크기 조정 - 최적화된 버전
  const handleResize = useCallback(debounce(() => {
    // 모든 화면 크기에서 medium 사이즈로 통일
    setScreenSize('medium');
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
    
    // 모바일일 때는 검은색, PC일 때는 하얀색 배경
    if (window.innerWidth >= 480) {
      document.body.style.backgroundColor = '#fff';
    } else {
      document.body.style.backgroundColor = '#000';
    }
    
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
  
  if (!result) return null;

  return (
    <>
      <GlobalStyle />
      <CaptureStyles forCapture={forCapture} />
      <Container ref={containerRef}>
        <CardWrapper ref={cardRef}>
          <FullScreenCard>
            <FaceContainer>
              <FaceImage src={`${process.env.PUBLIC_URL}/images/result_face.png`} alt="Face Analysis" />
              
              {/* 상단 측정 결과 */}
              <DataItem top="20%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
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
              <DataItem top="25%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
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
              <DataItem top="30%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                <DataLabel screenSize={screenSize}>눈 사이 거리</DataLabel>
                <DataValue screenSize={screenSize}>{result.eyeDistanceRatio.toFixed(2)}</DataValue>
              </DataItem>
              
              {/* 코 길이 */}
              <DataItem top="35%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
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
          
          <Header>
            <img src={`${process.env.PUBLIC_URL}/images/icon/logo-white.png`} alt="관상 로고" style={{ height: '40px' }} />
          </Header>
          
          <InterpretButton>
            Interpret with AI
          </InterpretButton>
          
          <ButtonsContainer>
            <Button onClick={onRetake}>
              <img src={`${process.env.PUBLIC_URL}/images/icon/retake.png`} alt="다시 찍기" />
            </Button>
            <Button onClick={captureScreen}>
              <img src={`${process.env.PUBLIC_URL}/images/icon/save.png`} alt="카드 저장" />
            </Button>
          </ButtonsContainer>

          <Footer>
            <Copyright>© 2025 eeezeen. All rights reserved.</Copyright>
          </Footer>
        </CardWrapper>
      </Container>
    </>
  );
};

export default ResultCard; 