/**
 * 얼굴 특징 관련 타입 정의 모음
 * 얼굴 분석 결과 및 시각화에 필요한 타입들을 정의합니다.
 * @module FaceFeatures
 */

/**
 * 얼굴 특징 데이터를 저장하는 인터페이스
 * WebcamDetection과 FaceAnalysisBox에서 사용하던 인터페이스를 통합했습니다.
 * 
 * @interface FaceFeatures
 */
export interface FaceFeatures {
  // 기본 얼굴 측정값
  /** 얼굴 너비 (정규화된 값) */
  faceWidth: number;
  /** 얼굴 높이 (정규화된 값) */
  faceHeight: number;
  /** 픽셀 단위 얼굴 너비 */
  faceWidthPixels?: number;
  
  // 얼굴 비율 관련
  /** 얼굴 너비-높이 비율 (이전 fWHR) */
  faceRatio: number;
  /** 얼굴 대칭성 점수 (이전 fSR) */
  symmetryScore: number;
  /** 이마, 코, 턱의 비율 */
  foreheadNoseChinRatio?: number;
  
  // 눈 관련 측정값
  /** 왼쪽 눈 너비 */
  eyeWidth_L: number;
  /** 오른쪽 눈 너비 */
  eyeWidth_R: number;
  /** 왼쪽 눈 기울기 (래디안) */
  eyeAngle_L: number;
  /** 오른쪽 눈 기울기 (래디안) */
  eyeAngle_R: number;
  /** 왼쪽 눈 기울기 (도) */
  eyeAngleDeg_L?: number;
  /** 오른쪽 눈 기울기 (도) */
  eyeAngleDeg_R?: number;
  /** 눈 사이 분리 정도 */
  eyeSeparation?: number;
  /** 눈 사이 거리 */
  eyeDistance?: number;
  /** 일반적인 동양인 기준 대비 비율 */
  eyeDistanceRatio?: number;
  /** 왼쪽 눈 깜빡임 정도 */
  eyeBlink_L?: number;
  /** 오른쪽 눈 깜빡임 정도 */
  eyeBlink_R?: number;
  
  // 코 관련 측정값
  /** 코 길이 */
  noseLength: number;
  /** 코 높이 */
  noseHeight: number;
  /** 왼쪽 콧망울 크기 */
  nostrilSize_L: number;
  /** 오른쪽 콧망울 크기 */
  nostrilSize_R: number;
  
  // 입 관련 측정값
  /** 입 너비 */
  mouthWidth?: number;
  /** 입 높이 */
  mouthHeight?: number;
  /** 입 곡률 */
  mouthCurve?: number;
  /** 입술 두께 (전체) */
  lipThickness?: number;
  /** 아랫입술 두께 */
  lowerLipThickness?: number;
  
  // 피부 및 색상 관련
  /** 피부 톤 값 */
  skinTone?: number;
  /** 주름 점수 */
  wrinkleScore?: number;
  /** 왼쪽 눈동자 색상 (HEX) */
  eyeIrisColor_L?: string;
  /** 오른쪽 눈동자 색상 (HEX) */
  eyeIrisColor_R?: string;
  /** 다크서클 색상 (HEX) */
  eyeDarkCircleColor?: string;
  /** 피부 평균 색상 (HEX) */
  skinToneColor?: string;
  
  // 기타 분석 결과
  /** 얼굴 구역 분석 점수 */
  faceRegionAnalysis?: number;
  
  // 확장성을 위한 인덱스 시그니처
  [key: string]: number | string | undefined;
}

/**
 * 얼굴 특징 계산을 위한 함수 인터페이스
 * 
 * @interface FaceFeaturesCalculator
 */
export interface FaceFeaturesCalculator {
  /**
   * 얼굴 랜드마크를 기반으로 특징을 계산하는 함수
   * 
   * @param {any} faceLandmarks - MediaPipe 얼굴 랜드마크 데이터
   * @returns {FaceFeatures} 계산된 얼굴 특징 데이터
   */
  (faceLandmarks: any): FaceFeatures;
  
  /** 최대 코 높이 (캘리브레이션용) */
  maxNoseHeight?: number;
  
  /** 최대 코 높이 비율 (캘리브레이션용) */
  maxNoseHeightRatio?: number;
}

/**
 * 얼굴 특징 시각화 속성 인터페이스
 * 
 * @interface FaceFeatureBarProps
 */
export interface FaceFeatureBarProps {
  /** 바 레이블 */
  label: string;
  
  /** 바 값 (0~1 사이) */
  value: number;
  
  /** 표시할 값 텍스트 */
  displayValue: string;
  
  /** 바의 상대적 수직 위치 (0~1 사이) */
  position: number;
  
  /** 외부 박스 X 좌표 */
  boxX: number;
  
  /** 외부 박스 Y 좌표 */
  boxY: number;
  
  /** 외부 박스 너비 */
  boxWidth: number;
  
  /** 외부 박스 높이 */
  boxHeight: number;
  
  /** 캔버스 렌더링 컨텍스트 */
  ctx: CanvasRenderingContext2D;
}

/**
 * 얼굴 분석 박스 속성 인터페이스
 * 
 * @interface FaceAnalysisBoxProps
 */
export interface FaceAnalysisBoxProps {
  /** 캔버스 렌더링 컨텍스트 */
  ctx: CanvasRenderingContext2D;
  
  /** 박스 시작 X 좌표 */
  boxX: number;
  
  /** 박스 시작 Y 좌표 */
  boxY: number;
  
  /** 박스 너비 */
  boxWidth: number;
  
  /** 박스 높이 */
  boxHeight: number;
  
  /** 얼굴 특징 데이터 */
  faceFeatures: FaceFeatures;
} 