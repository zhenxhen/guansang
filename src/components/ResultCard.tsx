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
    background-color: #EAEAEA;
  }
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
  justify-content: flex-start;
  min-height: 100vh;
  width: 100vw;
  height: 100vh;
  background-color: #EAEAEA;
  padding: 0;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 0 25px;
  box-sizing: border-box;
`;

const Header = styled.div`
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
  width: 100%;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  color: #9A9A9A;
  font-weight: 800;
  font-family: 'Pretendard', sans-serif;
`;

const HeaderSubtitle = styled.h2`
  font-size: 18px;
  color: #9A9A9A;
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-bottom: 0px;
  font-family: 'Pretendard', sans-serif;
`;

const BoldText = styled.span`
  font-weight: 800;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(212, 192, 145, 0.4);
  margin-bottom: 10px;
  position: relative;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  aspect-ratio: 1 / 1.5;
  box-sizing: border-box;
  overflow: hidden;
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
  width: 120%;
  height: 120%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  opacity: 0.7;
  object-fit: cover;
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
  color: #B58851;
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
  bottom: 20px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  justify-content: center;
  z-index: 10;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color:rgba(210, 210, 210, 0.57);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100px;
  height: 40px;
  font-family: 'Pretendard', sans-serif;

  &:hover {
    background-color: #555555;
  }

  & svg {
    margin-right: 8px;
  }
`;

const InterpretButton = styled.button`
  position: relative;
  margin: 20px auto 50px auto;
  width: 100%;
  max-width: 500px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(234, 213, 161, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(212, 192, 145, 0.7);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 10;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding-bottom: 10px;
  padding-top: 10px;
  width: 100%;
  background-color: #EAEAEA;
  font-family: 'Pretendard', sans-serif;
  z-index: 5;
`;

const Copyright = styled.div`
  color: #999;
  font-size: 9px;
  font-family: 'Pretendard', sans-serif;
  margin-top: 8px;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [screenSize, setScreenSize] = useState<'extraSmall' | 'small' | 'medium' | 'large'>('medium');
  
  // 화면 크기에 따라 텍스트 크기 조정 - 최적화된 버전
  const handleResize = useCallback(debounce(() => {
    const windowWidth = window.innerWidth;
    
    if (windowWidth <= 375) {
      setScreenSize('extraSmall');
    } else if (windowWidth < 450) {
      setScreenSize('small');
    } else if (windowWidth < 550) {
      setScreenSize('medium');
    } else {
      setScreenSize('large');
    }
  }, 100), []);
  
  useEffect(() => {
    // ResizeObserver 설정
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    // 초기 화면 크기 설정
    handleResize();
    
    // window resize 이벤트 추가
    window.addEventListener('resize', handleResize);
    
    // 카드 요소 관찰 시작
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [handleResize]);
  
  // 카드 저장 함수 구현
  const saveCard = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then(canvas => {
        // 캔버스를 이미지로 변환
        const image = canvas.toDataURL('image/png');
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = image;
        link.download = `관상데이터카드_${userName}_${new Date().toISOString().slice(0, 10)}.png`;
        // 다운로드 링크 클릭
        link.click();
      });
    }
  };

  // body 스타일 설정을 위한 부수 효과
  React.useEffect(() => {
    // 원래 스타일 저장
    const originalStyle = document.body.style.cssText;
    
    // body에 스타일 적용
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#EAEAEA';
    
    // 컴포넌트 언마운트 시 복원
    return () => {
      document.body.style.cssText = originalStyle;
    };
  }, []);
  
  if (!result) return null;

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <HeaderSubtitle>분석을 위한 <BoldText>{userName}</BoldText>님의 <br /> <BoldText>관상 데이터 카드</BoldText>입니다.</HeaderSubtitle>
        </Header>

        <Card ref={cardRef}>
          <FaceContainer>
            <FaceImage src={`${process.env.PUBLIC_URL}/images/result_face.png`} alt="Face Analysis" />
            
            {/* 상단 측정 결과 */}
            <DataItem top="4%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>얼굴 너비-높이 비율</DataLabel>
              <DataValue screenSize={screenSize}>{(result.faceRatio * 0.4 + 0.5).toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 왼쪽 상단 */}
            <DataItem top="12%" left="8%" textAlign="left" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>왼쪽 눈 색상</DataLabel>
              <ColorCircle color={result.eyeIrisColor_L || '#130603'} style={{ margin: '0 auto' }} screenSize={screenSize} />
            </DataItem>
            
            {/* 오른쪽 상단 */}
            <DataItem top="12%" right="8%" textAlign="right" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>오른쪽 눈 색상</DataLabel>
              <ColorCircle color={result.eyeIrisColor_R || '#190705'} style={{ margin: '0 auto' }} screenSize={screenSize} />
            </DataItem>
            
            {/* 얼굴 대칭성 - 위로 올림 */}
            <DataItem top="14%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>얼굴 대칭성</DataLabel>
              <DataValue screenSize={screenSize}>{(result.symmetryScore * 100).toFixed(0)}%</DataValue>
            </DataItem>
            
            {/* 왼쪽 중앙 - 위로 올림 */}
            <DataItem top="25%" left="2%" textAlign="left" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>왼쪽 눈 기울기</DataLabel>
              <DataValue screenSize={screenSize}>{result.eyeAngleDeg_L.toFixed(1)}°</DataValue>
            </DataItem>
            
            {/* 오른쪽 중앙 - 위로 올림 */}
            <DataItem top="25%" right="2%" textAlign="right" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>오른쪽 눈 기울기</DataLabel>
              <DataValue screenSize={screenSize}>{result.eyeAngleDeg_R.toFixed(1)}°</DataValue>
            </DataItem>
            
            {/* 눈 사이 거리 - 위로 올림 */}
            <DataItem top="23%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>눈 사이 거리</DataLabel>
              <DataValue screenSize={screenSize}>{result.eyeDistanceRatio.toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 코 길이 - 위로 올림 */}
            <DataItem top="33%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>코 길이</DataLabel>
              <DataValue screenSize={screenSize}>{result.noseLength.toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 코 높이 - 위로 올림 */}
            <DataItem top="42%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>코 높이</DataLabel>
              <DataValue screenSize={screenSize}>{result.noseHeight.toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 왼쪽 콧망울 - 위로 올림 */}
            <DataItem top="38%" left="9%" textAlign="left" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>왼쪽 콧망울 크기</DataLabel>
              <DataValue screenSize={screenSize}>{result.nostrilSize_L.toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 오른쪽 콧망울 - 위로 올림 */}
            <DataItem top="38%" right="9%" textAlign="right" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>오른쪽 콧망울 크기</DataLabel>
              <DataValue screenSize={screenSize}>{result.nostrilSize_R.toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 아랫입술 두께 - 위로 올림 */}
            <DataItem top="52%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>아랫입술 두께</DataLabel>
              <DataValue screenSize={screenSize}>{result.lowerLipThickness.toFixed(2)}</DataValue>
            </DataItem>
            
            {/* 피부 색상 - 위로 올림 */}
            <DataItem bottom="25%" left="25%" textAlign="center" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>피부 색상</DataLabel>
              <ColorCircle color={result.skinToneColor || '#c6b7b0'} style={{ margin: '0 auto' }} screenSize={screenSize} />
            </DataItem>
            
            {/* 다크서클 색상 - 위로 올림 */}
            <DataItem bottom="25%" right="25%" textAlign="center" screenSize={screenSize}>
              <DataLabel screenSize={screenSize}>다크서클 색상</DataLabel>
              <ColorCircle color={result.eyeDarkCircleColor || '#807673'} style={{ margin: '0 auto' }} screenSize={screenSize} />
            </DataItem>
          </FaceContainer>
          
          <ButtonsContainer>
            <Button onClick={onRetake}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V2M12 4C7.58172 4 4 7.58172 4 12M12 4C16.4183 4 20 7.58172 20 12M4 12C4 16.4183 7.58172 20 12 20M4 12H2M20 12H22M12 20C16.4183 20 20 16.4183 20 12M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              다시 찍기
            </Button>
            <Button onClick={() => {
              saveCard();
              onSave();
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 4V9H16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              카드 저장
            </Button>
          </ButtonsContainer>
        </Card>

        <InterpretButton>
          Interpret with AI
        </InterpretButton>

        <Footer>
          <Copyright>© 2025 eeezeen. All rights reserved.</Copyright>
        </Footer>
      </Container>
    </>
  );
};

export default ResultCard; 