import React, { useRef, useState, useEffect } from 'react';
import { 
  createFaceLandmarker, 
  setRunningMode, 
  drawBlendShapes, 
  hasGetUserMedia,
  FaceLandmarker, 
  DrawingUtils,
  getValueClass
} from '../utils/FaceLandmarkerUtils';
import { 
  calculateFaceFeatures, 
  drawFaceAnalysisBox, 
  drawNoseHeightIndicator 
} from './FaceAnalysisBox';
import AnalysisButton from './AnalysisButton';
import ResultCard from './ResultCard';
import { createGlobalStyle } from 'styled-components';

// 새로운 카테고리 정의 및 매핑
interface FeatureItem {
  name: string;
  keys: string[];
}

interface FeatureCategories {
  [category: string]: FeatureItem[];
}

const featureCategories: FeatureCategories = {
  '전체 비율': [
    { name: '얼굴 너비-높이 비율', keys: ['faceRatio'] }
  ],
  '얼굴 대칭성': [
    { name: '얼굴 대칭성', keys: ['symmetryScore'] } 
  ],
  '이마, 코, 턱의 비율': [
    { name: '이마, 코, 턱의 비율', keys: ['foreheadNoseChinRatio'] }
  ],
  '눈': [
    { name: '눈의 크기와 간격', keys: ['eyeWidth_L', 'eyeWidth_R', 'eyeSeparation'] },
    { name: '눈꺼리 방향', keys: ['eyeAngle_L', 'eyeAngle_R', 'eyeBlink_L', 'eyeBlink_R'] }
  ],
  '코': [
    { name: '코의 길이와 높이', keys: ['noseLength', 'noseHeight'] },
    { name: '콧망울의 크기', keys: ['nostrilSize_L', 'nostrilSize_R'] }
  ],
  '입': [
    { name: '입의 크기와 형태', keys: ['mouthWidth', 'mouthHeight', 'mouthCurve'] },
    { name: '입술 두께', keys: ['lipThickness'] }
  ],
  '피부': [
    { name: '피부색', keys: ['skinTone'] },
    { name: '주름의 위치와 깊이', keys: ['wrinkleScore'] }
  ],
  '기타': [
    { name: '얼굴 구역 분석', keys: ['faceRegionAnalysis'] }
  ]
};

// 표시 이름을 한글로 변환하는 함수
const getKoreanDisplayName = (key: string): string => {
  const nameMap: {[key: string]: string} = {
    // 표준 블렌드쉐이프 매핑
    'eyeBlink_L': '왼쪽 눈 깜빡임',
    'eyeBlink_R': '오른쪽 눈 깜빡임',
    'eyeSquint_L': '왼쪽 눈 찡그림',
    'eyeSquint_R': '오른쪽 눈 찡그림',
    'eyeWide_L': '왼쪽 눈 크게뜨기',
    'eyeWide_R': '오른쪽 눈 크게뜨기',
    'jawOpen': '턱 벌리기',
    'mouthClose': '입 닫기',
    'mouthSmile_L': '왼쪽 미소',
    'mouthSmile_R': '오른쪽 미소',
    'mouthDimple_L': '왼쪽 보조개',
    'mouthDimple_R': '오른쪽 보조개',
    'browDown_L': '왼쪽 눈썹 내리기',
    'browDown_R': '오른쪽 눈썹 내리기',
    
    // 새로운 카테고리 매핑
    'faceRatio': '얼굴 너비-높이 비율',
    'symmetryScore': '얼굴 대칭성',
    'foreheadNoseChinRatio': '이마, 코, 턱의 비율',
    'eyeWidth_L': '왼쪽 눈 크기',
    'eyeWidth_R': '오른쪽 눈 크기',
    'eyeSeparation': '눈 사이 간격',
    'eyeAngle_L': '왼쪽 눈 각도',
    'eyeAngle_R': '오른쪽 눈 각도',
    'noseLength': '코 길이',
    'noseHeight': '코 높이',
    'nostrilSize_L': '왼쪽 콧망울 크기',
    'nostrilSize_R': '오른쪽 콧망울 크기',
    'mouthWidth': '입 너비',
    'mouthHeight': '입 높이',
    'mouthCurve': '입 곡선',
    'lipThickness': '입술 두께',
    'skinTone': '피부색',
    'wrinkleScore': '주름 지수',
    'faceRegionAnalysis': '얼굴 구역 분석'
  };
  
  return nameMap[key] || key;
};

// 색상에 따라 텍스트 색상을 조정하는 함수 (밝은 배경은 어두운 텍스트, 어두운 배경은 밝은 텍스트)
function getContrastYIQ(hexcolor: string): string {
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
  * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
`;

const WebcamDetection: React.FC = () => {
  const [faceLandmarkerLoaded, setFaceLandmarkerLoaded] = useState(false);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastResultsRef = useRef<any>(null); // 마지막 결과 저장
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  const videoWidth = 480;
  
  // 뷰포트 높이 관리
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  // 양쪽 눈 기울기 차가 3도 이내일 때의 데이터를 저장하는 상태
  const [optimalFaceData, setOptimalFaceData] = useState<FaceFeatures | null>(null);
  
  // 결과 섹션과 그래프 섹션의 표시 상태 관리
  const [resultExpanded, setResultExpanded] = useState(false);
  const [graphExpanded, setGraphExpanded] = useState(false);
  
  // 히든 기능: 탭 카운트와 섹션 표시 상태
  const [tapCount, setTapCount] = useState(0);
  const [sectionsVisible, setSectionsVisible] = useState(false);

  // 디바이스 타입 상태 (모바일/데스크톱)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // 버튼 표시 상태
  const [showButton, setShowButton] = useState(false);
  const faceDetectedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 결과 카드 표시 상태
  const [showResultCard, setShowResultCard] = useState(false);

  // 저장된 데이터를 result로 참조
  const result = optimalFaceData;

  // 브라우저 높이 변경시 비디오 크기 조정 함수
  const updateViewportHeight = () => {
    const newHeight = window.innerHeight;
    const newWidth = window.innerWidth;
    console.log('현재 브라우저 크기:', newWidth, 'x', newHeight);
    setViewportHeight(newHeight);
    setViewportWidth(newWidth);
    
    // 모바일 환경인지 확인 (화면 너비가 768px 이하)
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    
    if (mobile) {
      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight}px`;
        containerRef.current.style.backgroundColor = '#000';
      }
      
      if (videoRef.current) {
        videoRef.current.style.height = `${newHeight}px`;
      }
      
      if (canvasRef.current) {
        canvasRef.current.style.height = `${newHeight}px`;
      }
      
      // 결과 패널이 화면을 가리지 않도록 조정
      const resultSections = document.querySelectorAll('.collapsible-section');
      resultSections.forEach((section: any) => {
        if (!section.querySelector('.collapsed')) {
          section.style.maxHeight = `${newHeight * 0.4}px`; // 화면의 40%로 제한
        }
      });
    } else {
      // PC 환경에서의 스타일 조정
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = '#fff';
      }
    }
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
    window.addEventListener('scroll', handleResize); // 스크롤 시에도 높이 체크
    
    // iOS Safari에서 방향 변경 시 필요
    window.addEventListener('orientationchange', () => {
      // 방향 전환 후 약간의 지연을 두고 높이 업데이트
      setTimeout(handleResize, 300);
    });
    
    // 페이지 로드 완료 후 한 번 더 업데이트 (일부 모바일 브라우저 대응)
    window.addEventListener('load', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('load', handleResize);
    };
  }, []);

  // 화면 탭/클릭 이벤트 처리를 위한 useEffect
  useEffect(() => {
    const handleTap = () => {
      setTapCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount >= 10) {
          setSectionsVisible(true);
          return 0; // 카운트 리셋
        }
        return newCount;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleTap);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleTap);
      }
    };
  }, []);

  // 카메라 시작 함수
  const startWebcam = async () => {
    if (!faceLandmarkerRef.current) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    try {
      await setRunningMode("VIDEO");
      
      // 높은 해상도와 프레임 레이트를 요청 (모바일 최적화)
      const constraints = {
        video: {
          facingMode: "user", // 전면 카메라 사용
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Initialize canvas context and drawing utils after video is loaded
        videoRef.current.onloadeddata = () => {
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              drawingUtilsRef.current = new DrawingUtils(ctx);
              // 비디오가 로드되면 감지 시작
              predictWebcam();
            }
          }
        };
      }
      
      setWebcamRunning(true);
    } catch (error) {
      console.error('Error starting webcam:', error);
    }
  };
  
  // 웹캠 중지 함수
  const stopWebcam = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    setWebcamRunning(false);
  };

  useEffect(() => {
    const loadFaceLandmarker = async () => {
      try {
        faceLandmarkerRef.current = await createFaceLandmarker("VIDEO");
        setFaceLandmarkerLoaded(true);
        console.log("FaceLandmarker initialized in VIDEO mode");
        
        // FaceLandmarker가 로드되면 자동으로 카메라 시작
        startWebcam();
      } catch (error) {
        console.error('Error loading FaceLandmarker:', error);
      }
    };

    loadFaceLandmarker();

    // Cleanup function
    return () => {
      // Stop the animation frame loop
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }

      // Stop the webcam stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 얼굴 특성을 계산하는 함수
  interface FaceFeatures {
    faceRatio: number;
    symmetryScore: number;
    foreheadNoseChinRatio: number;
    eyeWidth_L: number;
    eyeWidth_R: number;
    eyeSeparation: number;
    eyeAngle_L: number;
    eyeAngle_R: number;
    eyeAngleDeg_L: number; // 실제 각도 (도)
    eyeAngleDeg_R: number; // 실제 각도 (도)
    noseLength: number;
    noseHeight: number;
    nostrilSize_L: number;
    nostrilSize_R: number;
    mouthWidth: number;
    mouthHeight: number;
    mouthCurve: number;
    lipThickness: number;
    lowerLipThickness: number; // 아랫입술 두께
    skinTone: number;
    wrinkleScore: number;
    faceRegionAnalysis: number;
    eyeDistance: number; // 눈 사이 거리
    eyeDistanceRatio: number; // 일반적인 동양인 기준 대비 비율
    eyeIrisColor_L: string; // 왼쪽 눈동자 색상 (HEX)
    eyeIrisColor_R: string; // 오른쪽 눈동자 색상 (HEX)
    eyeDarkCircleColor: string; // 눈 아래 다크서클 색상 (HEX)
    skinToneColor: string; // 피부 평균 색상 (HEX)
    faceWidthPixels?: number; // 픽셀 단위 얼굴 너비
    [key: string]: number | string | undefined;
  }

  // maxNoseHeight 속성을 가진 확장된 함수 타입을 정의합니다
  interface FaceFeaturesCalculator {
    (faceLandmarks: any): FaceFeatures;
    maxNoseHeight?: number;
    maxNoseHeightRatio?: number;
  }

  // 함수에 타입 지정
  const calculateFaceFeatures: FaceFeaturesCalculator = (faceLandmarks: any): FaceFeatures => {
    if (!faceLandmarks || faceLandmarks.length === 0) return {} as FaceFeatures;
    
    // 얼굴 랜드마크를 이용한 특성 계산
    const landmarks = faceLandmarks[0]; // 첫 번째 얼굴의 랜드마크
    
    // 픽셀 색상을 추출하는 함수
    const getPixelColor = (landmarks: any, index: number, canvas: HTMLCanvasElement): string => {
      try {
        const x = landmarks[index].x * canvas.width;
        const y = landmarks[index].y * canvas.height;
        
        // 좌표가 캔버스 범위 내에 있는지 확인
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
          console.warn(`좌표가 캔버스 범위를 벗어남: (${x}, ${y})`);
          return '#FFFFFF';
        }
        
        // 캔버스에서 픽셀 색상 추출
        const ctx = canvas.getContext('2d');
        if (!ctx) return '#FFFFFF';
        
        // 주변 픽셀 값의 평균 추출 (노이즈 감소)
        const size = 3; // 3x3 영역
        const halfSize = Math.floor(size / 2);
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let dy = -halfSize; dy <= halfSize; dy++) {
          for (let dx = -halfSize; dx <= halfSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
              const data = ctx.getImageData(nx, ny, 1, 1).data;
              r += data[0];
              g += data[1];
              b += data[2];
              count++;
            }
          }
        }
        
        // 평균 계산
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        
        // RGB를 HEX로 변환 (문자열 패딩 사용)
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      } catch (error) {
        console.error('Error getting pixel color:', error);
        return '#000000';
      }
    };
    
    // 얼굴 외곽 포인트 가져오기 (FACE_OVAL)
    // 얼굴 상단 중앙 포인트 (이마 중앙)
    const foreheadIndex = 10;
    // 얼굴 하단 중앙 포인트 (턱 아래)
    const chinIndex = 152;
    // 왼쪽 얼굴 가장자리
    const leftFaceIndex = 323;
    // 오른쪽 얼굴 가장자리
    const rightFaceIndex = 93;
    // 입 하단 중앙 포인트
    const mouthBottomIndex = 17;
    // 코 끝 포인트
    const noseIndex = 1;
    
    const forehead = landmarks[foreheadIndex];
    const chin = landmarks[chinIndex];
    const leftFace = landmarks[leftFaceIndex];
    const rightFace = landmarks[rightFaceIndex];
    const mouthBottom = landmarks[mouthBottomIndex];
    const nose = landmarks[noseIndex];
    
    // 얼굴 높이: 이마부터 턱까지의 수직 거리
    const faceHeight = Math.sqrt(
      Math.pow(forehead.x - chin.x, 2) + 
      Math.pow(forehead.y - chin.y, 2)
    );
    
    // 얼굴 너비: 왼쪽에서 오른쪽 얼굴 가장자리까지의 수평 거리
    const faceWidth = Math.sqrt(
      Math.pow(leftFace.x - rightFace.x, 2) + 
      Math.pow(leftFace.y - rightFace.y, 2)
    );
    
    // 턱의 위치 변화에 더 민감하게 반응하기 위해 턱에서 코까지의 거리 측정
    const chinToNose = Math.sqrt(
      Math.pow(chin.x - nose.x, 2) + 
      Math.pow(chin.y - nose.y, 2)
    );
    
    // 턱에서 입까지의 거리
    const chinToMouth = Math.sqrt(
      Math.pow(chin.x - mouthBottom.x, 2) + 
      Math.pow(chin.y - mouthBottom.y, 2)
    );
    
    // 턱 위치 변화를 비율에 반영 (턱을 움직이면 chinToNose와 chinToMouth가 변화)
    const jawMovementFactor = chinToMouth / chinToNose;
    
    // 가로/세로 비율 계산 (너비/높이)에 턱 움직임 반영
    // jawMovementFactor가 작을수록(턱을 들수록) 비율이 커짐
    const rawFaceRatio = (faceWidth / faceHeight) * (1.5 - jawMovementFactor);
    
    // 비율 범위를 0.2~0.95로 확장하여 더 넓은 변화 범위 제공
    const normalizedFaceRatio = Math.min(Math.max((rawFaceRatio - 0.3) * (0.75 / 0.5) + 0.2, 0.2), 0.95);
    
    // 대칭성 계산을 위한 여러 특징점 비교
    // 1. 양쪽 눈 비교
    const leftEyeInnerIndex = 133;
    const leftEyeOuterIndex = 33;
    const rightEyeInnerIndex = 362;
    const rightEyeOuterIndex = 263;
    const leftEyeUpperIndex = 159; // 왼쪽 윗눈꺼풀
    const leftEyeLowerIndex = 145; // 왼쪽 아랫눈꺼풀
    const rightEyeUpperIndex = 386; // 오른쪽 윗눈꺼풀
    const rightEyeLowerIndex = 374; // 오른쪽 아랫눈꺼풀
    
    // 2. 양쪽 눈썹 위치 비교
    const leftEyebrowIndex = 66;
    const rightEyebrowIndex = 296;
    
    // 3. 양쪽 입꼬리 위치 비교
    const leftMouthIndex = 61;
    const rightMouthIndex = 291;
    const upperLipIndex = 13; // 윗입술 중앙
    const lowerLipIndex = 14; // 아랫입술 중앙
    
    // 4. 양쪽 콧볼 비교
    const leftNostrilIndex = 102;
    const rightNostrilIndex = 331;
    
    const leftEyeInner = landmarks[leftEyeInnerIndex];
    const leftEyeOuter = landmarks[leftEyeOuterIndex];
    const rightEyeInner = landmarks[rightEyeInnerIndex];
    const rightEyeOuter = landmarks[rightEyeOuterIndex];
    const leftEyeUpper = landmarks[leftEyeUpperIndex];
    const leftEyeLower = landmarks[leftEyeLowerIndex];
    const rightEyeUpper = landmarks[rightEyeUpperIndex];
    const rightEyeLower = landmarks[rightEyeLowerIndex];
    const leftEyebrow = landmarks[leftEyebrowIndex];
    const rightEyebrow = landmarks[rightEyebrowIndex];
    const leftMouth = landmarks[leftMouthIndex];
    const rightMouth = landmarks[rightMouthIndex];
    const upperLip = landmarks[upperLipIndex];
    const lowerLip = landmarks[lowerLipIndex];
    const leftNostril = landmarks[leftNostrilIndex];
    const rightNostril = landmarks[rightNostrilIndex];
    
    // 얼굴 중심선 (세로축) 계산
    const centerX = (forehead.x + chin.x) / 2;
    
    // 눈 열림 정도 계산 (눈 높이/너비 비율)
    const leftEyeWidth = Math.sqrt(
      Math.pow(leftEyeOuter.x - leftEyeInner.x, 2) + 
      Math.pow(leftEyeOuter.y - leftEyeInner.y, 2)
    );
    
    const rightEyeWidth = Math.sqrt(
      Math.pow(rightEyeOuter.x - rightEyeInner.x, 2) + 
      Math.pow(rightEyeOuter.y - rightEyeInner.y, 2)
    );
    
    const leftEyeHeight = Math.sqrt(
      Math.pow(leftEyeUpper.x - leftEyeLower.x, 2) + 
      Math.pow(leftEyeUpper.y - leftEyeLower.y, 2)
    );
    
    const rightEyeHeight = Math.sqrt(
      Math.pow(rightEyeUpper.x - rightEyeLower.x, 2) + 
      Math.pow(rightEyeUpper.y - rightEyeLower.y, 2)
    );
    
    // 눈 열림 비율
    const leftEyeOpening = leftEyeHeight / leftEyeWidth;
    const rightEyeOpening = rightEyeHeight / rightEyeWidth;
    
    // 입의 좌우 대칭성 (입 높이 좌우 비교)
    const leftMouthHeight = Math.sqrt(
      Math.pow(leftMouth.x - upperLip.x, 2) + 
      Math.pow(leftMouth.y - upperLip.y, 2)
    );
    
    const rightMouthHeight = Math.sqrt(
      Math.pow(rightMouth.x - upperLip.x, 2) + 
      Math.pow(rightMouth.y - upperLip.y, 2)
    );
    
    // 좌우 눈의 중심에서 중앙선까지의 거리
    const leftEyeCenter = {
      x: (leftEyeInner.x + leftEyeOuter.x) / 2,
      y: (leftEyeInner.y + leftEyeOuter.y) / 2
    };
    
    const rightEyeCenter = {
      x: (rightEyeInner.x + rightEyeOuter.x) / 2,
      y: (rightEyeInner.y + rightEyeOuter.y) / 2
    };
    
    const leftEyeToCenterDist = Math.abs(leftEyeCenter.x - centerX);
    const rightEyeToCenterDist = Math.abs(rightEyeCenter.x - centerX);
    
    // 눈썹 좌우 대칭 검사
    const leftEyebrowToCenterDist = Math.abs(leftEyebrow.x - centerX);
    const rightEyebrowToCenterDist = Math.abs(rightEyebrow.x - centerX);
    
    // 입 좌우 대칭 검사
    const leftMouthToCenterDist = Math.abs(leftMouth.x - centerX);
    const rightMouthToCenterDist = Math.abs(rightMouth.x - centerX);
    
    // 콧볼 좌우 대칭 검사
    const leftNostrilToCenterDist = Math.abs(leftNostril.x - centerX);
    const rightNostrilToCenterDist = Math.abs(rightNostril.x - centerX);
    
    // 각 특징에 대한 대칭 점수 계산 (1 - 차이/합계)
    // 각 특징의 좌우 차이가 적을수록 대칭성 높음
    const eyeWidthSymmetry = 1 - Math.abs(leftEyeWidth - rightEyeWidth) / (leftEyeWidth + rightEyeWidth);
    const eyeOpeningSymmetry = 1 - Math.abs(leftEyeOpening - rightEyeOpening) / Math.max(leftEyeOpening + rightEyeOpening, 0.01);
    const eyePositionSymmetry = 1 - Math.abs(leftEyeToCenterDist - rightEyeToCenterDist) / (leftEyeToCenterDist + rightEyeToCenterDist);
    const eyebrowSymmetry = 1 - Math.abs(leftEyebrowToCenterDist - rightEyebrowToCenterDist) / (leftEyebrowToCenterDist + rightEyebrowToCenterDist);
    const mouthCornerSymmetry = 1 - Math.abs(leftMouthToCenterDist - rightMouthToCenterDist) / (leftMouthToCenterDist + rightMouthToCenterDist);
    const mouthHeightSymmetry = 1 - Math.abs(leftMouthHeight - rightMouthHeight) / Math.max(leftMouthHeight + rightMouthHeight, 0.01);
    const nostrilSymmetry = 1 - Math.abs(leftNostrilToCenterDist - rightNostrilToCenterDist) / (leftNostrilToCenterDist + rightNostrilToCenterDist);
    
    // 눈 깜빡임 및 입 움직임에 더 민감하도록 가중치 적용
    const symmetryScore = (
      eyeWidthSymmetry * 0.1 +
      eyeOpeningSymmetry * 0.3 + // 눈 깜빡임에 더 큰 가중치
      eyePositionSymmetry * 0.1 +
      eyebrowSymmetry * 0.1 +
      mouthCornerSymmetry * 0.1 +
      mouthHeightSymmetry * 0.2 + // 입 움직임에 더 큰 가중치
      nostrilSymmetry * 0.1
    );
    
    // 대칭성 점수 정규화 (0.2 ~ 0.95 범위로)
    // 왼쪽 눈을 감거나 한쪽 입을 올리면 약 20% 정도가 되도록 조정
    const normalizedSymmetry = 0.2 + Math.pow(symmetryScore, 1.5) * 0.75;
    
    // 눈 기울기 계산
    // 수평선을 기준으로 한 눈 기울기 계산 (0도가 수평, 눈 꼬리가 쳐지면 음수)
    
    // 오른쪽 눈 기울기 계산 (눈꼬리가 올라가면 양수, 내려가면 음수)
    let rightEyeAngle = Math.atan2(
      rightEyeOuter.y - rightEyeInner.y,  // y 차이
      rightEyeOuter.x - rightEyeInner.x   // x 차이
    ) * (180 / Math.PI);
    
    // 오른쪽 눈 각도 보정: -1을 곱해 부호 반전 (수평이 0도가 되도록)
    rightEyeAngle = -1 * rightEyeAngle;
    
    // 왼쪽 눈 기울기 계산 - 직접 각도 계산
    // 왼쪽 눈의 경우 x축 방향이 반대이므로 각도 계산 방식을 조정
    const leftEyeDeltaY = leftEyeOuter.y - leftEyeInner.y;
    const leftEyeDeltaX = leftEyeInner.x - leftEyeOuter.x; // x축 방향 반전

    // 각도 계산 - arctangent를 사용해 기울기 계산 (라디안)
    const leftEyeSlopeRad = Math.atan(leftEyeDeltaY / leftEyeDeltaX);
    
    // 라디안에서 도로 변환
    let leftEyeAngle = -1 * leftEyeSlopeRad * (180 / Math.PI);
    
    // 각도 보정 - x축 방향이 반대인 경우 처리
    if (leftEyeDeltaX < 0) {
      // 3, 4분면에 있을 경우 180도 보정
      if (leftEyeAngle > 0) {
        leftEyeAngle = leftEyeAngle - 180;
      } else {
        leftEyeAngle = leftEyeAngle + 180;
      }
    }
    
    // 각도를 반올림하여 소수점 한 자리까지 표시
    const leftEyeAngleDeg = parseFloat(leftEyeAngle.toFixed(1));
    const rightEyeAngleDeg = parseFloat(rightEyeAngle.toFixed(1));
    
    console.log("Eye angles - L:", leftEyeAngleDeg, "R:", rightEyeAngleDeg); // 디버깅용
    
    // 0에서 1 사이로 정규화 (그래프 표시용) - 0.5가 중앙(0도)이 되도록 수정
    // 눈 기울기 범위를 -50도에서 50도로 확장
    const normalizedLeftEyeAngle = Math.max(0, Math.min(1, (leftEyeAngleDeg + 50) / 100));
    const normalizedRightEyeAngle = Math.max(0, Math.min(1, (rightEyeAngleDeg + 50) / 100));
    
    // 눈 사이 거리 계산 (양쪽 눈의 안쪽 코너 사이 거리)
    const eyeDistance = Math.sqrt(
      Math.pow(rightEyeInner.x - leftEyeInner.x, 2) + 
      Math.pow(rightEyeInner.y - leftEyeInner.y, 2)
    );

    // 일반적인 동양인 표준 눈 사이 거리를 기준(1.0)으로 한 상대적 비율 계산
    // 얼굴 너비에 대한 눈 사이 거리의 비율로 표준화
    // 일반적인 동양인의 경우 눈 사이 거리가 얼굴 너비의 약 1/4.5 (0.22) 정도
    const standardEyeDistanceRatio = 0.24;
    const currentEyeDistanceRatio = eyeDistance / faceWidth;
    const eyeDistanceRatio = currentEyeDistanceRatio / standardEyeDistanceRatio;

    console.log("눈 사이 거리:", eyeDistance, "표준 비율:", eyeDistanceRatio.toFixed(2));
    
    // 코 길이와 높이 계산
    // 코 중심선 포인트들
    const noseTopIndex = 168; // 코의 상단 중앙 (코 뿌리)
    const noseTipIndex = 1; // 코 끝
    const noseLowerIndex = 8; // 코의 하단 중앙 (콧구멍 사이)
    
    const noseTop = landmarks[noseTopIndex];
    const noseTip = landmarks[noseTipIndex];
    const noseLower = landmarks[noseLowerIndex];
    
    // 코의 길이: 코 뿌리부터 코 끝까지의 직선 거리
    const noseLength = Math.sqrt(
      Math.pow(noseTop.x - noseTip.x, 2) + 
      Math.pow(noseTop.y - noseTip.y, 2)
    );
    
    // 코 높이: 얼굴 평면에서부터 코 끝까지의 z축 거리
    // Z 좌표가 클수록 얼굴에서 더 튀어나온 것을 의미함
    // 얼굴 평균 Z 좌표를 기준으로 코 끝의 상대적 돌출 정도 계산
    
    // 얼굴 평균 Z 좌표 계산 (눈, 광대, 입 주변의 포인트 사용)
    const faceZPoints = [
      landmarks[leftEyeInnerIndex].z, 
      landmarks[rightEyeInnerIndex].z,
      landmarks[leftFaceIndex].z,
      landmarks[rightFaceIndex].z,
      landmarks[upperLipIndex].z,
      landmarks[lowerLipIndex].z
    ];
    
    const avgFaceZ = faceZPoints.reduce((sum, z) => sum + z, 0) / faceZPoints.length;
    
    // 코 끝 Z 좌표에서 얼굴 평균 Z 좌표를 빼서 돌출 정도 계산
    // MediaPipe의 Z 좌표는 작을수록 카메라에서 멀어지므로, 부호를 반전
    let noseHeight = -(noseTip.z - avgFaceZ);
    
    // 콧망울 크기 계산
    // 콧망울 관련 랜드마크 인덱스 (MediaPipe Face Mesh 모델 기준)
    // 이미 정의된 leftNostrilIndex(102), rightNostrilIndex(331) 사용
    const noseBaseIndex = 4; // 코 밑 중앙
    const leftNostrilInnerIndex = 220; // 왼쪽 콧망울 내측
    const rightNostrilInnerIndex = 440; // 오른쪽 콧망울 내측
    
    // 콧망울 랜드마크 좌표
    // leftNostril, rightNostril은 이미 정의되어 있으므로 재사용
    const noseBase = landmarks[noseBaseIndex];
    const leftNostrilInner = landmarks[leftNostrilInnerIndex];
    const rightNostrilInner = landmarks[rightNostrilInnerIndex];
    
    // 왼쪽 콧망울 너비 (콧망울 외측에서 내측까지의 거리)
    const leftNostrilWidth = Math.sqrt(
      Math.pow(leftNostril.x - leftNostrilInner.x, 2) +
      Math.pow(leftNostril.y - leftNostrilInner.y, 2)
    );
    
    // 오른쪽 콧망울 너비
    const rightNostrilWidth = Math.sqrt(
      Math.pow(rightNostril.x - rightNostrilInner.x, 2) +
      Math.pow(rightNostril.y - rightNostrilInner.y, 2)
    );
    
    // 콧망울 너비 평균
    const avgNostrilWidth = (leftNostrilWidth + rightNostrilWidth) / 2;
    
    // 코 너비 (양쪽 콧망울 외측 사이의 거리)
    const noseWidth = Math.sqrt(
      Math.pow(leftNostril.x - rightNostril.x, 2) +
      Math.pow(leftNostril.y - rightNostril.y, 2)
    );
    
    // 동양인 표준 콧망울 비율 (콧망울 너비 / 코 너비)
    // 일반적으로 동양인의 경우 콧망울이 코 너비의 약 1/4 (0.25) 정도
    const standardNostrilRatio = 0.25;
    const currentNostrilRatio_L = leftNostrilWidth / noseWidth;
    const currentNostrilRatio_R = rightNostrilWidth / noseWidth;
    
    // 동양인 평균(1.0) 기준 상대적 콧망울 크기 비율
    const nostrilRatio_L = currentNostrilRatio_L / standardNostrilRatio;
    const nostrilRatio_R = currentNostrilRatio_R / standardNostrilRatio;
    
    // 음수값 방지 및 최대 3.0까지 제한 (평균의 3배)
    const cappedNostrilRatio_L = Math.min(Math.max(nostrilRatio_L, 0.2), 3.0);
    const cappedNostrilRatio_R = Math.min(Math.max(nostrilRatio_R, 0.2), 3.0);
    
    console.log("콧망울 측정 - 왼쪽:", nostrilRatio_L.toFixed(2), "오른쪽:", nostrilRatio_R.toFixed(2));
    
    // 입술 두께 계산
    // 입술 관련 랜드마크 인덱스 (MediaPipe Face Mesh 모델 기준)
    const lowerLipTopIndex = 17; // 아랫입술 상단 중앙 (입 안쪽)
    const lowerLipBottomIndex = 15; // 아랫입술 하단 중앙
    const mouthLeftIndex = 61; // 입술 왼쪽 끝
    const mouthRightIndex = 291; // 입술 오른쪽 끝
    
    // 입술 랜드마크 좌표
    const lowerLipTop = landmarks[lowerLipTopIndex];
    const lowerLipBottom = landmarks[lowerLipBottomIndex];
    const mouthLeft = landmarks[mouthLeftIndex];
    const mouthRight = landmarks[mouthRightIndex];
    
    // 입 너비 (입 양쪽 끝 사이의 거리)
    const mouthWidth = Math.sqrt(
      Math.pow(mouthLeft.x - mouthRight.x, 2) +
      Math.pow(mouthLeft.y - mouthRight.y, 2)
    );
    
    // 아랫입술 두께 (아랫입술 상단에서 하단까지의 거리)
    const lowerLipThickness = Math.sqrt(
      Math.pow(lowerLipTop.x - lowerLipBottom.x, 2) +
      Math.pow(lowerLipTop.y - lowerLipBottom.y, 2)
    );
    
    // 동양인 표준 입술 두께 비율
    const standardLowerLipRatio = 0.25; // 입 너비 대비 아랫입술 비율
    
    // 현재 측정된 비율
    const currentLowerLipRatio = lowerLipThickness / mouthWidth; // 입 너비로 정규화
    
    // 동양인 평균(1.0) 기준 상대적 입술 두께 비율
    const lowerLipRatio = currentLowerLipRatio / standardLowerLipRatio;
    
    // 음수값 방지 및 최대값 제한 (기존 값 수정)
    const cappedLowerLipRatio = Math.min(Math.max(lowerLipRatio, 0.2), 2.0); // 3.0에서 2.0으로 변경해 일관성 유지
    
    // 전체 입술 두께 비율 (아랫입술만 사용)
    const lipThicknessRatio = lowerLipRatio;
    const cappedLipThicknessRatio = Math.min(Math.max(lipThicknessRatio, 0.2), 2.0);
    
    console.log("입술 두께 측정 - 아랫입술:", lowerLipRatio.toFixed(2));
    
    // 동양인 표준 코 길이를 기준으로 한 상대적 비율 계산
    // 얼굴 너비에 대한 코 길이의 비율
    // 일반적인 동양인의 경우 코 길이가 얼굴 너비의 약 1/3.5 (0.286) 정도
    const standardNoseLengthRatio = 0.5;
    const currentNoseLengthRatio = noseLength / faceWidth;
    const noseLengthRatio = currentNoseLengthRatio / standardNoseLengthRatio;

    // 동양인 표준 코 높이를 기준으로 한 상대적 비율 계산
    // 코 길이에 대한 코 높이의 비율
    // 일반적인 동양인의 경우 코 높이가 코 길이의 약 1/3 (0.33) 정도
    const standardNoseHeightRatio = 0.6;
    const currentNoseHeightRatio = noseHeight / noseLength;
    let noseHeightRatio = currentNoseHeightRatio / standardNoseHeightRatio;

    // 가장 높은 코 수치를 갱신하기 위한 static 변수 (클로저)
    if (typeof calculateFaceFeatures.maxNoseHeight === 'undefined') {
      calculateFaceFeatures.maxNoseHeight = 0;
      calculateFaceFeatures.maxNoseHeightRatio = 0;
    }
    
    // 현재 측정값이 이전 최댓값보다 크면 갱신
    if (noseHeight > calculateFaceFeatures.maxNoseHeight!) {
      calculateFaceFeatures.maxNoseHeight = noseHeight;
      calculateFaceFeatures.maxNoseHeightRatio = noseHeightRatio;
      console.log("코 높이 최댓값 갱신:", noseHeight, "비율:", noseHeightRatio.toFixed(2));
    }
    
    // 음수값 방지 및 최대 4.0까지 제한 (평균의 4배)
    const cappedNoseLengthRatio = Math.min(Math.max(noseLengthRatio, 0.2), 4.0);
    const cappedNoseHeightRatio = Math.min(Math.max(noseHeightRatio, 0.2), 4.0);
    
    console.log("코 측정 - 길이 비율:", noseLengthRatio.toFixed(2), "높이 비율:", noseHeightRatio.toFixed(2), 
      "최대 높이 비율:", (calculateFaceFeatures.maxNoseHeightRatio || 0).toFixed(2));

    // 눈동자 색상 추출 (왼쪽 눈 - FACE_LANDMARKS_LEFT_IRIS 중심점 사용)
    const leftIrisIndex = 468; // 왼쪽 눈동자 중심점
    const rightIrisIndex = 473; // 오른쪽 눈동자 중심점
    // 다크서클은 눈 아래쪽 더 낮은 위치로 조정
    const leftDarkCircleIndex = 162; // 왼쪽 눈 아래 위치 조정
    const rightDarkCircleIndex = 389; // 오른쪽 눈 아래 위치 조정
    const leftCheekIndex = 117; // 왼쪽 볼
    const rightCheekIndex = 346; // 오른쪽 볼

    // 캔버스 참조 가져오기
    const canvas = document.getElementById('output_canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('캔버스를 찾을 수 없습니다');
      return { 
        /* 기존 반환 데이터 유지 */
        eyeIrisColor_L: '#000000',
        eyeIrisColor_R: '#000000',
        eyeDarkCircleColor: '#000000',
        skinToneColor: '#000000'
      } as any;
    }

    // 색상 추출
    const eyeIrisColor_L = getPixelColor(landmarks, leftIrisIndex, canvas);
    const eyeIrisColor_R = getPixelColor(landmarks, rightIrisIndex, canvas);

    // 눈 아래 다크서클 색상 (왼쪽과 오른쪽 평균)
    const leftDarkCircleColor = getPixelColor(landmarks, leftDarkCircleIndex, canvas);
    const rightDarkCircleColor = getPixelColor(landmarks, rightDarkCircleIndex, canvas);
    const eyeDarkCircleColor = leftDarkCircleColor; // 간단하게 왼쪽만 사용하거나 두 색상의 평균을 계산

    // 피부 색상 추출 (이마, 볼, 턱 여러 지점의 평균)
    const foreheadColor = getPixelColor(landmarks, foreheadIndex, canvas);
    const leftCheekColor = getPixelColor(landmarks, leftCheekIndex, canvas);
    const rightCheekColor = getPixelColor(landmarks, rightCheekIndex, canvas);
    const chinColor = getPixelColor(landmarks, chinIndex, canvas);

    // 양쪽 볼 색상의 평균값을 피부 톤으로 사용
    // 각 색상의 HEX에서 RGB 컴포넌트 추출
    const getColorComponents = (hexColor: string): { r: number, g: number, b: number } => {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      return { r, g, b };
    };
    
    // 좌우 볼 색상 컴포넌트 가져오기
    const leftCheekComponents = getColorComponents(leftCheekColor);
    const rightCheekComponents = getColorComponents(rightCheekColor);
    
    // RGB 컴포넌트 평균 계산
    const avgR = Math.round((leftCheekComponents.r + rightCheekComponents.r) / 2);
    const avgG = Math.round((leftCheekComponents.g + rightCheekComponents.g) / 2);
    const avgB = Math.round((leftCheekComponents.b + rightCheekComponents.b) / 2);
    
    // 평균 RGB를 HEX로 변환
    const skinToneColor = `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
    
    // 디버깅용 로그
    console.log("볼 색상 - 왼쪽:", leftCheekColor, "오른쪽:", rightCheekColor, "평균:", skinToneColor);

    // 얼굴 너비와 높이 계산 (얼굴 탐지 바운딩 박스 기준)
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    
    // 얼굴 랜드마크를 순회하며 경계 찾기
    for (const landmark of landmarks) {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    
    // 픽셀 단위 얼굴 너비 계산
    const faceWidthPixels = maxX - minX;
    
    // 실제 특성을 계산한 결과 반환
    return {
      faceRatio: normalizedFaceRatio,
      symmetryScore: normalizedSymmetry,
      foreheadNoseChinRatio: Math.random() * 0.8 + 0.2,
      eyeWidth_L: leftEyeWidth / faceWidth * 10,
      eyeWidth_R: rightEyeWidth / faceWidth * 10,
      eyeSeparation: Math.random() * 0.5 + 0.3,
      eyeAngle_L: normalizedLeftEyeAngle,
      eyeAngle_R: normalizedRightEyeAngle,
      eyeAngleDeg_L: leftEyeAngleDeg,
      eyeAngleDeg_R: rightEyeAngleDeg,
      noseLength: cappedNoseLengthRatio, // 동양인 평균 대비 코 길이 비율
      noseHeight: cappedNoseHeightRatio, // 동양인 평균 대비 코 높이 비율 (실시간 값)
      nostrilSize_L: cappedNostrilRatio_L, // 동양인 평균 대비 왼쪽 콧망울 크기 비율
      nostrilSize_R: cappedNostrilRatio_R, // 동양인 평균 대비 오른쪽 콧망울 크기 비율
      mouthWidth: Math.random() * 0.6 + 0.3,
      mouthHeight: Math.random() * 0.5 + 0.2,
      mouthCurve: Math.random() * 0.7 + 0.1,
      lipThickness: cappedLipThicknessRatio, // 동양인 평균 대비 입술 두께 비율 (상/하 평균)
      lowerLipThickness: cappedLowerLipRatio, // 동양인 평균 대비 아랫입술 두께 비율
      skinTone: Math.random() * 0.8 + 0.1,
      wrinkleScore: Math.random() * 0.5 + 0.1,
      faceRegionAnalysis: Math.random() * 0.7 + 0.2,
      eyeDistance: eyeDistance,
      eyeDistanceRatio: eyeDistanceRatio,
      eyeIrisColor_L: eyeIrisColor_L,
      eyeIrisColor_R: eyeIrisColor_R,
      eyeDarkCircleColor: eyeDarkCircleColor,
      skinToneColor: skinToneColor,
      faceWidthPixels, // 픽셀 단위 얼굴 너비 추가
    };
  };

  const predictWebcam = () => {
    // 컴포넌트가 언마운트됐거나 필요한 ref가 없으면 루프 중단
    if (
      !videoRef.current || 
      !canvasRef.current || 
      !faceLandmarkerRef.current || 
      !drawingUtilsRef.current
    ) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const drawingUtils = drawingUtilsRef.current;
    
    // Resize canvas to match video dimensions
    const ratio = video.videoHeight / video.videoWidth;
    video.style.width = `${videoWidth}px`;
    video.style.height = `${videoWidth * ratio}px`;
    canvas.style.width = `${videoWidth}px`;
    canvas.style.height = `${videoWidth * ratio}px`;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    try {
      // 현재 시간 기록
      const startTimeMs = performance.now();
      
      // 원본 비디오 프레임을 캔버스에 그리기
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 원본 비디오 프레임 그리기
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // 비디오에서 얼굴 감지
      const results = faceLandmarker.detectForVideo(video, startTimeMs);
      
      // 얼굴이 감지되었는지 확인
      const faceDetected = results.faceLandmarks && results.faceLandmarks.length > 0;
      
      // 얼굴이 감지되면 5초 타이머 설정
      if (faceDetected) {
        // 이미 타이머가 실행 중이 아니고 버튼이 표시되지 않은 경우에만 타이머 설정
        if (!faceDetectedTimeoutRef.current && !showButton) {
          faceDetectedTimeoutRef.current = setTimeout(() => {
            setShowButton(true);
            faceDetectedTimeoutRef.current = null;
          }, 5000);
        }
        
        // 기존 결과에 계산된 얼굴 특성 추가
        const faceFeatures = calculateFaceFeatures(results.faceLandmarks);
        
        // 기존 결과와 계산된 특성을 병합
        const enhancedResults = { 
          ...results,
          // 기존 faceBlendshapes에 계산된 특성 추가
          faceBlendshapes: results.faceBlendshapes.map((blendshape: any) => {
            // 새로운 카테고리 추가
            const extendedCategories = [...blendshape.categories];
            
            // 계산된 특성들을 카테고리로 추가
            Object.keys(faceFeatures).forEach(key => {
              extendedCategories.push({
                categoryName: key,
                score: faceFeatures[key]
              });
            });
            
            return {
              ...blendshape,
              categories: extendedCategories
            };
          })
        };
        
        lastResultsRef.current = enhancedResults;
        
        // 결과가 없을 때 표시되는 메시지 숨기기
        const noResultsMessage = document.getElementById('no-results-message');
        if (noResultsMessage) {
          noResultsMessage.style.display = 'none';
        }
      } else if (!lastResultsRef.current) {
        // 이전 결과도 없고 현재도 감지되지 않은 경우 메시지 표시
        const noResultsMessage = document.getElementById('no-results-message');
        if (noResultsMessage) {
          noResultsMessage.style.display = 'block';
        }
      }
      
      // 마지막으로 감지된 결과 또는 현재 결과 사용
      const displayResults = faceDetected ? results : lastResultsRef.current;
      
      if (ctx && displayResults && displayResults.faceLandmarks) {
        // 얼굴 랜드마크 그리기
        for (const landmarks of displayResults.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 }
          );
          
          // 얼굴 메쉬 아래에 검정색 박스 추가
          if (ctx) {
            // 얼굴 영역의 바운딩 박스 계산
            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;
            
            // 얼굴 랜드마크를 순회하며 경계 찾기
            for (const landmark of landmarks) {
              const x = landmark.x * canvas.width;
              const y = landmark.y * canvas.height;
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
            
            // 바운딩 박스의 너비와 높이 계산
            const boxWidth = maxX - minX;
            const boxHeight = (maxY - minY) * 0.2; // 얼굴 높이의 20% 크기로 박스 높이 설정
            
            // 박스 너비 값을 콘솔에 출력 (디버깅용)
            console.log(`Box dimensions: width=${boxWidth.toFixed(0)}px, height=${boxHeight.toFixed(0)}px`);
            
            // 박스 위치 계산 (얼굴 아래에 위치)
            const boxX = minX;
            const boxY = maxY + 5; // 얼굴 아래 5픽셀 간격
            
            // 외부 컴포넌트를 사용하여 얼굴 분석 박스 그리기
            const faceFeatures = calculateFaceFeatures(displayResults.faceLandmarks);
            drawFaceAnalysisBox({
              ctx,
              boxX,
              boxY,
              boxWidth,
              boxHeight,
              faceFeatures
            });
          }
          
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: "#E0E0E0", lineWidth: 1     }
          );
          
          // FaceAnalysisBox에서 제공하는 함수를 사용하여 코 끝에 흰색 동그라미 추가
          const faceFeatures = calculateFaceFeatures(displayResults.faceLandmarks);
          drawNoseHeightIndicator(ctx, displayResults.faceLandmarks, faceFeatures);
        }

        // Update blend shapes - 항상 현재 결과를 사용
        if (displayResults.faceBlendshapes) {
          const videoBlendShapes = document.getElementById("video-blend-shapes");
          if (videoBlendShapes) {
            // 콘솔에 디버그 정보
            console.log("Updating blend shapes with data:", 
              displayResults.faceBlendshapes[0]?.categories?.length || 0, "categories");
            
            // 그래프 업데이트
            drawBlendShapes(videoBlendShapes, displayResults.faceBlendshapes);
          }
          
          // 얼굴 특성 그래프 업데이트
          if (faceDetected || lastResultsRef.current) {
            const faceFeatures = calculateFaceFeatures(displayResults.faceLandmarks);
            
            // 양쪽 눈 기울기 차이 계산
            const leftEyeAngle = faceFeatures.eyeAngleDeg_L;
            const rightEyeAngle = faceFeatures.eyeAngleDeg_R;
            const eyeAngleDiff = Math.abs(leftEyeAngle - rightEyeAngle);
            
            // 눈 기울기 차이가 3도 이내일 때 데이터 저장
            if (eyeAngleDiff <= 3) {
              setOptimalFaceData(faceFeatures);
            }
            
            // 얼굴 너비-높이 비율 그래프 업데이트
            const faceRatioBar = document.getElementById("face-ratio-bar");
            const faceRatioText = document.getElementById("face-ratio-text");
            if (faceRatioBar && faceRatioText) {
              const faceRatioValue = faceFeatures.faceRatio;
              // 실제 비율을 0-100% 스케일로 변환 (그래프 표시용)
              const faceRatioPercent = (faceRatioValue * 100).toFixed(1);
              faceRatioBar.style.width = `${faceRatioPercent}%`;
              // 텍스트는 실제 비율 값으로 표시 (0.6-0.8 정도가 일반적인 비율)
              const actualRatio = (faceRatioValue * 0.4 + 0.5).toFixed(2);
              faceRatioText.textContent = `${actualRatio}`;
              
              // 값에 따른 색상 클래스 설정
              const ratioValueClass = getValueClass(faceRatioValue);
              faceRatioBar.classList.remove('test-low', 'test-medium', 'test-high');
              faceRatioBar.classList.add(`test-${ratioValueClass}`);
            }
            
            // 얼굴 대칭성 그래프 업데이트
            const symmetryBar = document.getElementById("symmetry-bar");
            const symmetryText = document.getElementById("symmetry-text");
            if (symmetryBar && symmetryText) {
              const symmetryValue = faceFeatures.symmetryScore;
              // 정규화된 값을 0-100% 스케일로 변환 (그래프 표시용)
              const symmetryPercent = (symmetryValue * 100).toFixed(0);
              symmetryBar.style.width = `${symmetryPercent}%`;
              // 텍스트는 퍼센트로 표시
              symmetryText.textContent = `${symmetryPercent}%`;
              
              // 값에 따른 색상 클래스 설정 (낮은 대칭성은 눈에 띄게)
              let symmetryValueClass;
              if (symmetryValue < 0.3) symmetryValueClass = 'low';
              else if (symmetryValue < 0.6) symmetryValueClass = 'medium';
              else symmetryValueClass = 'high';
              
              symmetryBar.classList.remove('test-low', 'test-medium', 'test-high');
              symmetryBar.classList.add(`test-${symmetryValueClass}`);
            }
            
            // 눈 기울기 UI 업데이트
            const eyeAngle_L_Bar = document.getElementById("eye-angle-l-bar");
            const eyeAngle_L_Text = document.getElementById("eye-angle-l-text");
            const eyeAngle_R_Bar = document.getElementById("eye-angle-r-bar");
            const eyeAngle_R_Text = document.getElementById("eye-angle-r-text");
            
            if (eyeAngle_L_Bar && eyeAngle_L_Text && eyeAngle_R_Bar && eyeAngle_R_Text) {
              const leftEyeAngleValue = faceFeatures.eyeAngle_L;
              const rightEyeAngleValue = faceFeatures.eyeAngle_R;
              
              // 0-1 값을 0-100% 스케일로 변환 (그래프 표시용)
              const leftEyeAnglePercent = (leftEyeAngleValue * 100).toFixed(1);
              const rightEyeAnglePercent = (rightEyeAngleValue * 100).toFixed(1);
              
              eyeAngle_L_Bar.style.width = `${leftEyeAnglePercent}%`;
              eyeAngle_R_Bar.style.width = `${rightEyeAnglePercent}%`;
              
              // 텍스트는 실제 각도로 표시
              eyeAngle_L_Text.textContent = `${faceFeatures.eyeAngleDeg_L.toFixed(1)}°`;
              eyeAngle_R_Text.textContent = `${faceFeatures.eyeAngleDeg_R.toFixed(1)}°`;
              
              // 값에 따른 색상 클래스 설정
              const leftAngleValueClass = getValueClass(leftEyeAngleValue);
              const rightAngleValueClass = getValueClass(rightEyeAngleValue);
              
              eyeAngle_L_Bar.classList.remove('test-low', 'test-medium', 'test-high');
              eyeAngle_R_Bar.classList.remove('test-low', 'test-medium', 'test-high');
              
              eyeAngle_L_Bar.classList.add(`test-${leftAngleValueClass}`);
              eyeAngle_R_Bar.classList.add(`test-${rightAngleValueClass}`);
            }
            
            // 눈 사이 거리 그래프 업데이트
            const eyeDistanceBar = document.getElementById("eye-distance-bar");
            const eyeDistanceText = document.getElementById("eye-distance-text");
            if (eyeDistanceBar && eyeDistanceText) {
              const eyeDistanceValue = faceFeatures.eyeDistanceRatio;
              // 비율을 0-100% 스케일로 변환 (0.5~1.5의 비율을 0~100%로)
              const cappedValue = Math.min(Math.max(eyeDistanceValue, 0.5), 1.5);
              const eyeDistancePercent = ((cappedValue - 0.5) / 1) * 100;
              eyeDistanceBar.style.width = `${eyeDistancePercent}%`;
              // 텍스트는 실제 비율 값으로 표시
              eyeDistanceText.textContent = `${eyeDistanceValue.toFixed(2)}`;
              
              // 값에 따른 색상 클래스 설정
              let distanceValueClass;
              if (eyeDistanceValue < 0.85) distanceValueClass = 'low';
              else if (eyeDistanceValue > 1.15) distanceValueClass = 'high';
              else distanceValueClass = 'medium';
              
              eyeDistanceBar.classList.remove('test-low', 'test-medium', 'test-high');
              eyeDistanceBar.classList.add(`test-${distanceValueClass}`);
            }

            // 코 길이와 높이 그래프 업데이트
            const noseLengthBar = document.getElementById("nose-length-bar");
            const noseLengthText = document.getElementById("nose-length-text");
            const noseHeightBar = document.getElementById("nose-height-bar");
            const noseHeightText = document.getElementById("nose-height-text");
            
            if (noseLengthBar && noseLengthText) {
              const noseLengthValue = faceFeatures.noseLength;
              // 1.0을 50%로 표시하고, 범위는 0.2~4.0을 0~100%로 스케일링
              const noseLengthPercent = Math.min(Math.max((noseLengthValue - 0.2) / 3.8 * 100, 0), 100).toFixed(1);
              noseLengthBar.style.width = `${noseLengthPercent}%`;
              // 텍스트는 실제 비율 값으로 표시
              noseLengthText.textContent = `${noseLengthValue.toFixed(2)}`;
              
              // 값에 따른 색상 클래스 설정
              let lengthValueClass;
              if (noseLengthValue < 0.8) lengthValueClass = 'low';
              else if (noseLengthValue > 1.2) lengthValueClass = 'high';
              else lengthValueClass = 'medium';
              
              noseLengthBar.classList.remove('test-low', 'test-medium', 'test-high');
              noseLengthBar.classList.add(`test-${lengthValueClass}`);
            }
            
            if (noseHeightBar && noseHeightText) {
              const noseHeightValue = faceFeatures.noseHeight;
              // 1.0을 50%로 표시하고, 범위는 0.2~4.0을 0~100%로 스케일링
              const noseHeightPercent = Math.min(Math.max((noseHeightValue - 0.2) / 3.8 * 100, 0), 100).toFixed(1);
              noseHeightBar.style.width = `${noseHeightPercent}%`;
              // 텍스트는 실제 비율 값으로 표시
              noseHeightText.textContent = `${noseHeightValue.toFixed(2)}`;
              
              // 값에 따른 색상 클래스 설정
              let heightValueClass;
              if (noseHeightValue < 0.8) heightValueClass = 'low';
              else if (noseHeightValue > 1.2) heightValueClass = 'high';
              else heightValueClass = 'medium';
              
              noseHeightBar.classList.remove('test-low', 'test-medium', 'test-high');
              noseHeightBar.classList.add(`test-${heightValueClass}`);
            }

            // 콧망울 크기 그래프 업데이트
            const nostrilSize_L_Bar = document.getElementById("nostril-size-l-bar");
            const nostrilSize_L_Text = document.getElementById("nostril-size-l-text");
            const nostrilSize_R_Bar = document.getElementById("nostril-size-r-bar");
            const nostrilSize_R_Text = document.getElementById("nostril-size-r-text");
            
            if (nostrilSize_L_Bar && nostrilSize_L_Text) {
              const nostrilSizeValue = faceFeatures.nostrilSize_L;
              // 1.0을 50%로 표시하고, 범위는 0.2~3.0을 0~100%로 스케일링
              const nostrilSizePercent = Math.min(Math.max((nostrilSizeValue - 0.2) / 2.8 * 100, 0), 100).toFixed(1);
              nostrilSize_L_Bar.style.width = `${nostrilSizePercent}%`;
              // 텍스트는 실제 비율 값으로 표시
              nostrilSize_L_Text.textContent = `${nostrilSizeValue.toFixed(2)}`;
              
              // 값에 따른 색상 클래스 설정
              let sizeValueClass;
              if (nostrilSizeValue < 0.8) sizeValueClass = 'low';
              else if (nostrilSizeValue > 1.2) sizeValueClass = 'high';
              else sizeValueClass = 'medium';
              
              nostrilSize_L_Bar.classList.remove('test-low', 'test-medium', 'test-high');
              nostrilSize_L_Bar.classList.add(`test-${sizeValueClass}`);
            }
            
            if (nostrilSize_R_Bar && nostrilSize_R_Text) {
              const nostrilSizeValue = faceFeatures.nostrilSize_R;
              // 1.0을 50%로 표시하고, 범위는 0.2~3.0을 0~100%로 스케일링
              const nostrilSizePercent = Math.min(Math.max((nostrilSizeValue - 0.2) / 2.8 * 100, 0), 100).toFixed(1);
              nostrilSize_R_Bar.style.width = `${nostrilSizePercent}%`;
              // 텍스트는 실제 비율 값으로 표시
              nostrilSize_R_Text.textContent = `${nostrilSizeValue.toFixed(2)}`;
              
              // 값에 따른 색상 클래스 설정
              let sizeValueClass;
              if (nostrilSizeValue < 0.8) sizeValueClass = 'low';
              else if (nostrilSizeValue > 1.2) sizeValueClass = 'high';
              else sizeValueClass = 'medium';
              
              nostrilSize_R_Bar.classList.remove('test-low', 'test-medium', 'test-high');
              nostrilSize_R_Bar.classList.add(`test-${sizeValueClass}`);
            }

            // 색상 표시 UI 업데이트
            const eyeIrisColorL = document.getElementById("eye-iris-color-l");
            const eyeIrisColorR = document.getElementById("eye-iris-color-r");
            const darkCircleColor = document.getElementById("dark-circle-color");
            const skinToneColorEl = document.getElementById("skin-tone-color");

            if (eyeIrisColorL) {
              const irisColor = faceFeatures.eyeIrisColor_L as string;
              eyeIrisColorL.style.backgroundColor = irisColor;
              eyeIrisColorL.textContent = irisColor;
              eyeIrisColorL.style.color = getContrastYIQ(irisColor.slice(1));
            }

            if (eyeIrisColorR) {
              const irisColor = faceFeatures.eyeIrisColor_R as string;
              eyeIrisColorR.style.backgroundColor = irisColor;
              eyeIrisColorR.textContent = irisColor;
              eyeIrisColorR.style.color = getContrastYIQ(irisColor.slice(1));
            }

            if (darkCircleColor) {
              const dColor = faceFeatures.eyeDarkCircleColor as string;
              darkCircleColor.style.backgroundColor = dColor;
              darkCircleColor.textContent = dColor;
              darkCircleColor.style.color = getContrastYIQ(dColor.slice(1));
            }

            if (skinToneColorEl) {
              const sColor = faceFeatures.skinToneColor as string;
              skinToneColorEl.style.backgroundColor = sColor;
              skinToneColorEl.textContent = sColor;
              skinToneColorEl.style.color = getContrastYIQ(sColor.slice(1));
            }

            // 입술 두께 그래프 업데이트
            const lowerLipBar = document.getElementById("lower-lip-bar");
            const lowerLipText = document.getElementById("lower-lip-text");
            
            if (lowerLipBar && lowerLipText) {
              const lowerLipValue = faceFeatures.lowerLipThickness;
              // 1.0을 50%로 표시하고, 범위는 0.2~2.0을 0~100%로 스케일링 (최대값 2.0으로 수정)
              const lowerLipPercent = Math.min(Math.max((lowerLipValue - 0.2) / 1.8 * 100, 0), 100).toFixed(1);
              lowerLipBar.style.width = `${lowerLipPercent}%`;
              // 텍스트는 실제 비율 값으로 표시
              lowerLipText.textContent = `${lowerLipValue.toFixed(2)}`;
              
              // 값에 따른 색상 클래스 설정
              let lipValueClass;
              if (lowerLipValue < 0.8) lipValueClass = 'low';
              else if (lowerLipValue > 1.2) lipValueClass = 'high';
              else lipValueClass = 'medium';
              
              lowerLipBar.classList.remove('test-low', 'test-medium', 'test-high');
              lowerLipBar.classList.add(`test-${lipValueClass}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error detecting video:', error);
    }
    
    // Keep looping - 최대한 빨리 다음 프레임 처리
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  // 그래프 렌더링 함수
  const renderFeatureCategories = () => {
    return Object.keys(featureCategories).map((category) => (
      <div key={category} className="feature-category">
        <h4 className="category-title">{category}</h4>
        <div className="category-items">
          {featureCategories[category].map((item: FeatureItem) => (
            <div key={item.name} className="feature-item">
              <p className="feature-name">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Analysis 버튼 클릭 핸들러
  const handleAnalysisClick = () => {
    // 웹캠 중지
    stopWebcam();
    
    // 결과 카드 표시
    setShowResultCard(true);
  };

  // 다시 찍기 버튼 클릭 핸들러
  const handleRetake = () => {
    // 결과 카드 숨기기
    setShowResultCard(false);
    
    // 다시 웹캠 시작
    startWebcam();
  };

  // 카드 저장 핸들러
  const handleSaveCard = () => {
    // 저장은 ResultCard 컴포넌트에서 처리됨
    console.log('카드가 저장되었습니다.');
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (faceDetectedTimeoutRef.current) {
        clearTimeout(faceDetectedTimeoutRef.current);
      }
    };
  }, []);

  // 결과 카드 페이지가 표시 중이면 메인 컴포넌트 대신 결과 카드 표시
  if (showResultCard && result) {
    return (
      <ResultCard 
        result={result}
        onRetake={handleRetake}
        onSave={handleSaveCard}
      />
    );
  }

  return (
    <>
      <GlobalStyle />
      <div 
        className="mobile-container" 
        ref={containerRef} 
        style={{ 
          height: isMobile ? `${viewportHeight}px` : '100vh',
          backgroundColor: isMobile ? '#000' : '#fff',
          minHeight: '100vh',
          display: isMobile ? 'block' : 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif"
        }}
      >
        <style>
        {`
          /* 기본 리셋 */
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          
          /* 메인 컨테이너 */
          .mobile-container {
            width: 100%;
            overflow: hidden;
          }
          
          /* 모바일일 때 */
          @media (max-width: 768px) {
            .mobile-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              background-color: #000;
            }
          }
          
          /* PC 모드일 때 */
          @media (min-width: 769px) {
            .mobile-container {
              background-color: #fff;
              padding: 20px 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
          }
          
          /* 웹캠 컨테이너 */
          .webcam-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          /* 모바일일 때 */
          @media (max-width: 768px) {
            .webcam-container {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              background-color: #000;
            }
          }
          
          /* PC 모드일 때 */
          @media (min-width: 769px) {
            .webcam-container {
              position: relative;
              width: 400px;
              height: 800px;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
              background-color: #000;
              margin: auto;
            }
          }
          
          /* 비디오 래퍼 */
          .video-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          /* 비디오 요소 */
          #webcam {
            width: 100%;
            height: auto;
            object-fit: contain;
          }
          
          /* 모바일일 때 */
          @media (max-width: 768px) {
            #webcam {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }
          
          /* PC 모드일 때 */
          @media (min-width: 769px) {
            #webcam {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          
          /* 캔버스 요소 */
          .output_canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          
          /* 결과 섹션 */
          .collapsible-section {
            position: relative;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.95);
            z-index: 10;
            max-width: 460px;
            margin: 0 auto;
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }
          
          .hidden-section {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
          
          /* 모바일일 때 결과 섹션 */
          @media (max-width: 768px) {
            .collapsible-section {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              max-width: 100%;
              z-index: 100;
              transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
              margin: 0;
            }
          }
          
          /* PC 모드일 때 결과 섹션 */
          @media (min-width: 769px) {
            .collapsible-section {
              position: relative;
              width: 400px;
              margin: 8px auto;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
          }
          
          /* 섹션 제목 */
          .section-title {
            margin: 0;
            padding: 15px;
            background-color: rgba(240, 240, 240, 0.9);
            color: #333;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .section-title::after {
            content: '▼';
            font-size: 12px;
            transition: transform 0.3s ease;
          }
          
          .section-title.collapsed::after {
            transform: rotate(-90deg);
          }
          
          /* 섹션 내용 */
          .section-content {
            max-height: 60vh;
            overflow-y: auto;
            transition: max-height 0.3s ease;
            padding: 0 15px;
          }
          
          .section-content.collapsed {
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
            overflow: hidden;
          }
          
          /* 그 외 스타일 유지 */
          .result-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 15px 0;
          }

          .result-label {
            font-weight: bold;
            color: #555;
            font-size: 14px;
          }

          .result-value {
            color: #333;
            font-size: 14px;
            text-align: right;
          }

          .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .blend-shapes-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            flex-wrap: wrap;
          }

          .blend-shapes-label {
            width: 35%;
            font-size: 14px;
          }

          .blend-shapes-value-container {
            position: relative;
            width: 45%;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            margin: 0 5px;
          }

          .zero-line {
            position: absolute;
            top: 0;
            left: 50%;
            width: 1px;
            height: 100%;
            background-color: #333;
            z-index: 1;
          }
          
          .blend-shapes-value {
            height: 100%;
            background-color: #4CAF50;
            border-radius: 5px;
            transition: width 0.3s ease;
          }

          .blend-shapes-text {
            width: 15%;
            text-align: right;
            font-size: 14px;
          }

          .feature-desc {
            font-size: 12px;
            color: #777;
            margin-left: 5px;
          }

          .color-sample {
            display: inline-block;
            width: 80px;
            height: 24px;
            border-radius: 4px;
            margin-left: 10px;
            text-align: center;
            color: white;
            text-shadow: 0 0 2px black;
            font-size: 12px;
            line-height: 24px;
          }

          #no-results-message {
            text-align: center;
            margin: 15px;
            color: #777;
            font-size: 14px;
          }

          .test-low { background-color: #FF9800; }
          .test-medium { background-color: #4CAF50; }
          .test-high { background-color: #2196F3; }
        `}
        </style>
        
        <div 
          className="webcam-container" 
          style={{ 
            height: isMobile ? `${viewportHeight}px` : '800px'
          }}
        >
          <div 
            className="video-wrapper" 
            style={{ 
              height: isMobile ? `${viewportHeight}px` : '100%',
              position: 'relative' // 추가
            }}
          >
            <video 
              id="webcam" 
              autoPlay 
              playsInline
              muted
              ref={videoRef}
              style={{ 
                height: isMobile ? `${viewportHeight}px` : '100%',
                objectFit: isMobile ? 'contain' : 'cover'
              }}
            ></video>
            <canvas 
              className="output_canvas" 
              id="output_canvas"
              ref={canvasRef}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: isMobile ? `${viewportHeight}px` : '100%'
              }}
            ></canvas>
            
            {/* 카메라 화면 위에 버튼 추가 */}
            <AnalysisButton 
              show={showButton} 
              onClick={handleAnalysisClick} 
            />
          </div>
        </div>

        {/* 측정 결과 섹션 */}
        {result && (
          <div className={`collapsible-section ${!sectionsVisible ? 'hidden-section' : ''}`}>
            <h4 
              className={`section-title ${resultExpanded ? '' : 'collapsed'}`}
              onClick={() => setResultExpanded(!resultExpanded)}
            >
              측정 결과
            </h4>
            <div className={`section-content ${resultExpanded ? '' : 'collapsed'}`}>
              <div className="result-grid">
                <div className="result-label">얼굴 너비-높이 비율:</div>
                <div className="result-value">{(result.faceRatio * 0.4 + 0.5).toFixed(2)}</div>
                
                <div className="result-label">얼굴 대칭성:</div>
                <div className="result-value">{(result.symmetryScore * 100).toFixed(0)}%</div>
                
                <div className="result-label">왼쪽 눈 기울기:</div>
                <div className="result-value">{result.eyeAngleDeg_L.toFixed(1)}°</div>
                
                <div className="result-label">오른쪽 눈 기울기:</div>
                <div className="result-value">{result.eyeAngleDeg_R.toFixed(1)}°</div>
                
                <div className="result-label">눈 사이 거리:</div>
                <div className="result-value">{result.eyeDistanceRatio.toFixed(2)}</div>
                
                <div className="result-label">코 길이:</div>
                <div className="result-value">{result.noseLength.toFixed(2)}</div>
                
                <div className="result-label">코 높이:</div>
                <div className="result-value">{result.noseHeight.toFixed(2)}</div>
                
                <div className="result-label">왼쪽 콧망울 크기:</div>
                <div className="result-value">{result.nostrilSize_L.toFixed(2)}</div>
                
                <div className="result-label">오른쪽 콧망울 크기:</div>
                <div className="result-value">{result.nostrilSize_R.toFixed(2)}</div>
                
                <div className="result-label">아랫입술 두께:</div>
                <div className="result-value">{result.lowerLipThickness.toFixed(2)}</div>
                
                <div className="result-label">왼쪽 눈동자 색상:</div>
                <div className="result-value">{result.eyeIrisColor_L}</div>
                
                <div className="result-label">오른쪽 눈동자 색상:</div>
                <div className="result-value">{result.eyeIrisColor_R}</div>
                
                <div className="result-label">다크서클 색상:</div>
                <div className="result-value">{result.eyeDarkCircleColor}</div>
                
                <div className="result-label">피부 색상:</div>
                <div className="result-value">{result.skinToneColor}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 실시간 측정 데이터 섹션 */}
        <div className={`collapsible-section ${!sectionsVisible ? 'hidden-section' : ''}`} style={{ bottom: result && isMobile ? 'auto' : 0 }}>
          <h4 
            className={`section-title ${graphExpanded ? '' : 'collapsed'}`}
            onClick={() => setGraphExpanded(!graphExpanded)}
          >
            실시간 측정 데이터
          </h4>
          <div className={`section-content ${graphExpanded ? '' : 'collapsed'}`}>
            <div className="feature-sections">
              <div className="feature-section">
                <ul className="feature-list">
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">얼굴 너비-높이 비율</span>
                    <div className="blend-shapes-value-container">
                      <div id="face-ratio-bar" className="blend-shapes-value" style={{ width: '0%' }}></div>
                    </div>
                    <span id="face-ratio-text" className="blend-shapes-text">0.0</span>
                    <span className="feature-desc">(가로/세로)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">얼굴 대칭성</span>
                    <div className="blend-shapes-value-container">
                      <div id="symmetry-bar" className="blend-shapes-value" style={{ width: '0%' }}></div>
                    </div>
                    <span id="symmetry-text" className="blend-shapes-text">0.0%</span>
                    <span className="feature-desc">(좌우 균형)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">왼쪽 눈 기울기</span>
                    <div className="blend-shapes-value-container">
                      <div className="zero-line"></div>
                      <div id="eye-angle-l-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="eye-angle-l-text" className="blend-shapes-text">0°</span>
                    <span className="feature-desc">(각도)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">오른쪽 눈 기울기</span>
                    <div className="blend-shapes-value-container">
                      <div className="zero-line"></div>
                      <div id="eye-angle-r-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="eye-angle-r-text" className="blend-shapes-text">0°</span>
                    <span className="feature-desc">(각도)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">눈 사이 거리</span>
                    <div className="blend-shapes-value-container">
                      <div id="eye-distance-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="eye-distance-text" className="blend-shapes-text">1.0</span>
                    <span className="feature-desc">(기준 대비 비율)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">코 길이</span>
                    <div className="blend-shapes-value-container">
                      <div id="nose-length-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="nose-length-text" className="blend-shapes-text">50</span>
                    <span className="feature-desc">(%)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">코 높이</span>
                    <div className="blend-shapes-value-container">
                      <div id="nose-height-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="nose-height-text" className="blend-shapes-text">50</span>
                    <span className="feature-desc">(%)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">왼쪽 콧망울 크기</span>
                    <div className="blend-shapes-value-container">
                      <div id="nostril-size-l-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="nostril-size-l-text" className="blend-shapes-text">1.00</span>
                    <span className="feature-desc">(비율)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">오른쪽 콧망울 크기</span>
                    <div className="blend-shapes-value-container">
                      <div id="nostril-size-r-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="nostril-size-r-text" className="blend-shapes-text">1.00</span>
                    <span className="feature-desc">(비율)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">아랫입술 두께</span>
                    <div className="blend-shapes-value-container">
                      <div id="lower-lip-bar" className="blend-shapes-value" style={{ width: '50%' }}></div>
                    </div>
                    <span id="lower-lip-text" className="blend-shapes-text">1.00</span>
                    <span className="feature-desc">(비율)</span>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">왼쪽 눈동자 색상</span>
                    <div className="color-sample" id="eye-iris-color-l" style={{ backgroundColor: '#000000' }}>#000000</div>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">오른쪽 눈동자 색상</span>
                    <div className="color-sample" id="eye-iris-color-r" style={{ backgroundColor: '#000000' }}>#000000</div>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">다크서클 색상</span>
                    <div className="color-sample" id="dark-circle-color" style={{ backgroundColor: '#000000' }}>#000000</div>
                  </li>
                  <li className="blend-shapes-item">
                    <span className="blend-shapes-label">피부 색상</span>
                    <div className="color-sample" id="skin-tone-color" style={{ backgroundColor: '#000000' }}>#000000</div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="blend-shapes-container">
              <ul className="blend-shapes-list" id="video-blend-shapes"></ul>
            </div>
            
            <div id="no-results-message" style={{ display: 'none', textAlign: 'center', margin: '20px', color: '#666' }}>
              얼굴이 인식되지 않았습니다. 카메라 앞에서 정면을 향해 주세요.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebcamDetection; 