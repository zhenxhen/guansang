/**
 * UI 관련 유틸리티 함수 모음
 * 사용자 인터페이스와 관련된 헬퍼 함수들을 제공합니다.
 * @module UIUtils
 */

/**
 * 값에 따라 CSS 클래스를 결정하는 함수
 * 
 * @param {number} score - 점수 값 (0~1 사이)
 * @returns {string} CSS 클래스명 ('high', 'medium', 'low' 중 하나)
 */
export const getValueClass = (score: number): string => {
  if (score >= 0.5) return 'high';  // 50% 이상이면 높음
  if (score >= 0.2) return 'medium'; // 20% 이상이면 중간
  return 'low';  // 그 외는 낮음
};

/**
 * 특성 키를 한글 표시 이름으로 변환하는 함수
 * 
 * @param {string} key - 특성 키
 * @returns {string} 한글 표시 이름
 */
export const getKoreanDisplayName = (key: string): string => {
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
    
    // 얼굴 특성 매핑
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
    'faceRegionAnalysis': '얼굴 구역 분석',
    'eyeDistance': '눈 사이 거리'
  };
  
  return nameMap[key] || key;
};

/**
 * 모바일 디바이스인지 확인하는 함수
 * 
 * @returns {boolean} 모바일 기기면 true, 아니면 false
 */
export const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * 뷰포트 높이 업데이트 함수
 * 모바일 환경에 따라 UI 요소의 크기를 동적으로 조정합니다.
 * 
 * @param {React.RefObject<HTMLDivElement>} containerRef - 컨테이너 요소 참조
 * @param {React.RefObject<HTMLVideoElement>} videoRef - 비디오 요소 참조
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef - 캔버스 요소 참조
 */
export const updateViewportHeight = (
  containerRef: React.RefObject<HTMLDivElement>,
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
): void => {
  const newHeight = window.innerHeight;
  
  // 모바일 환경인지 확인 (화면 너비가 768px 이하)
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    if (containerRef.current) {
      containerRef.current.style.height = `${newHeight}px`;
    }
    
    if (videoRef.current) {
      videoRef.current.style.height = `${newHeight}px`;
    }
    
    if (canvasRef.current) {
      canvasRef.current.style.height = `${newHeight}px`;
    }
    
    // 결과 패널이 화면을 가리지 않도록 조정
    const resultSections = document.querySelectorAll('.collapsible-section');
    resultSections.forEach((section: Element) => {
      const collapsed = section.querySelector('.collapsed');
      if (!collapsed) {
        (section as HTMLElement).style.maxHeight = `${newHeight * 0.4}px`; // 화면의 40%로 제한
      }
    });
  }
}; 