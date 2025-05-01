/**
 * 얼굴 분석 관련 유틸리티 함수 모음
 * @module FacialAnalysisUtils
 */
import { FaceFeatures } from '../../types/FaceFeatures';
import { drawCircleWithText, drawFeatureBar } from '../graphics/GraphicsUtils';

/**
 * 얼굴 특성 계산 함수
 * 얼굴 랜드마크를 기반으로 다양한 얼굴 특성을 계산합니다.
 * 
 * @param {any} landmarks - MediaPipe 얼굴 랜드마크 데이터
 * @returns {FaceFeatures} 계산된 얼굴 특성 정보
 */
export const calculateFaceFeatures = (landmarks: any): FaceFeatures => {
  // 기본값 초기화
  let faceWidth = 0;
  let faceHeight = 0;
  let eyeWidth_L = 0;
  let eyeWidth_R = 0;
  let noseLength = 0;
  let noseHeight = 0;
  let nostrilSize_L = 0;
  let nostrilSize_R = 0;
  let eyeAngle_L = 0;
  let eyeAngle_R = 0;
  let symmetryScore = 0;
  let eyeDistance = 0;
  
  // 얼굴 너비 계산
  // 얼굴 외곽선의 양쪽 끝 랜드마크 (보통 인덱스 93과 323)
  const leftFaceIndex = 93;
  const rightFaceIndex = 323;
  faceWidth = calculateDistance(
    landmarks[leftFaceIndex].x, 
    landmarks[leftFaceIndex].y,
    landmarks[rightFaceIndex].x, 
    landmarks[rightFaceIndex].y
  );
  
  // 얼굴 높이 계산
  // 이마(인덱스 10)와 턱(인덱스 152) 사이 거리
  const foreheadIndex = 10;
  const chinIndex = 152;
  faceHeight = calculateDistance(
    landmarks[foreheadIndex].x, 
    landmarks[foreheadIndex].y,
    landmarks[chinIndex].x, 
    landmarks[chinIndex].y
  );
  
  // 눈 너비 계산 (왼쪽)
  // 보통 눈의 양쪽 끝 랜드마크 (인덱스에 따라 다름)
  const leftEyeInnerIndex = 362;
  const leftEyeOuterIndex = 263;
  eyeWidth_L = calculateDistance(
    landmarks[leftEyeInnerIndex].x, 
    landmarks[leftEyeInnerIndex].y,
    landmarks[leftEyeOuterIndex].x, 
    landmarks[leftEyeOuterIndex].y
  );
  
  // 눈 너비 계산 (오른쪽)
  const rightEyeInnerIndex = 133;
  const rightEyeOuterIndex = 33;
  eyeWidth_R = calculateDistance(
    landmarks[rightEyeInnerIndex].x, 
    landmarks[rightEyeInnerIndex].y,
    landmarks[rightEyeOuterIndex].x, 
    landmarks[rightEyeOuterIndex].y
  );
  
  // 눈 사이 거리
  eyeDistance = calculateDistance(
    landmarks[leftEyeInnerIndex].x, 
    landmarks[leftEyeInnerIndex].y,
    landmarks[rightEyeInnerIndex].x, 
    landmarks[rightEyeInnerIndex].y
  );
  
  // 코 높이 (눈 사이에서 코 끝까지)
  const betweenEyesIndex = 168;
  const noseTipIndex = 1;
  noseHeight = calculateDistance(
    landmarks[betweenEyesIndex].x, 
    landmarks[betweenEyesIndex].y,
    landmarks[noseTipIndex].x, 
    landmarks[noseTipIndex].y
  );
  
  // 코 길이 계산
  // 코의 시작(콧대 위)과 코 끝 사이의 거리
  const noseTopIndex = 6;
  noseLength = calculateDistance(
    landmarks[noseTopIndex].x, 
    landmarks[noseTopIndex].y,
    landmarks[noseTipIndex].x, 
    landmarks[noseTipIndex].y
  );
  
  // 콧망울 크기 계산
  const leftNostrilIndex = 115;
  const rightNostrilIndex = 344;
  nostrilSize_L = calculateDistance(
    landmarks[leftNostrilIndex].x, 
    landmarks[leftNostrilIndex].y,
    landmarks[noseTipIndex].x, 
    landmarks[noseTipIndex].y
  );
  nostrilSize_R = calculateDistance(
    landmarks[rightNostrilIndex].x, 
    landmarks[rightNostrilIndex].y,
    landmarks[noseTipIndex].x, 
    landmarks[noseTipIndex].y
  );
  
  // 눈 각도 계산 - 좌측
  const leftEyeTopIndex = 386; // 왼쪽 눈 위쪽 점
  const leftEyeBottomIndex = 374; // 왼쪽 눈 아래쪽 점
  eyeAngle_L = calculateAngle(
    landmarks[leftEyeOuterIndex].x, 
    landmarks[leftEyeOuterIndex].y,
    landmarks[leftEyeInnerIndex].x, 
    landmarks[leftEyeInnerIndex].y
  );
  
  // 눈 각도 계산 - 우측
  const rightEyeTopIndex = 159; // 오른쪽 눈 위쪽 점
  const rightEyeBottomIndex = 145; // 오른쪽 눈 아래쪽 점
  eyeAngle_R = calculateAngle(
    landmarks[rightEyeInnerIndex].x, 
    landmarks[rightEyeInnerIndex].y,
    landmarks[rightEyeOuterIndex].x, 
    landmarks[rightEyeOuterIndex].y
  );
  
  // 얼굴 비율 (너비/높이)
  const faceRatio = faceWidth / faceHeight;
  
  // 얼굴 대칭성 점수 계산 (0~1, 1에 가까울수록 대칭)
  // 양쪽 눈, 콧망울, 입 등의 대칭성을 고려하여 계산
  const eyeWidthSymmetry = 1 - Math.abs(eyeWidth_L - eyeWidth_R) / Math.max(eyeWidth_L, eyeWidth_R);
  const nostrilSymmetry = 1 - Math.abs(nostrilSize_L - nostrilSize_R) / Math.max(nostrilSize_L, nostrilSize_R);
  const angleSymmetry = 1 - Math.abs(eyeAngle_L - eyeAngle_R) / (Math.max(Math.abs(eyeAngle_L), Math.abs(eyeAngle_R)) + 0.01);
  
  // 대칭성 점수는 여러 요소의 가중 평균
  symmetryScore = (eyeWidthSymmetry * 0.4 + nostrilSymmetry * 0.3 + angleSymmetry * 0.3);
  
  // 각도를 도(degree) 단위로 변환
  const eyeAngleDeg_L = eyeAngle_L * (180 / Math.PI);
  const eyeAngleDeg_R = eyeAngle_R * (180 / Math.PI);
  
  // 결과 반환
  return {
    faceWidth,
    faceHeight,
    faceRatio,  // 이전 fWHR
    eyeWidth_L,
    eyeWidth_R,
    noseLength,
    noseHeight,
    nostrilSize_L,
    nostrilSize_R,
    eyeAngle_L,
    eyeAngle_R,
    eyeAngleDeg_L,
    eyeAngleDeg_R,
    symmetryScore,  // 이전 fSR
    eyeDistance
  };
};

/**
 * 두 점 사이의 거리 계산 함수
 * 
 * @param {number} x1 - 첫 번째 점의 x 좌표
 * @param {number} y1 - 첫 번째 점의 y 좌표
 * @param {number} x2 - 두 번째 점의 x 좌표
 * @param {number} y2 - 두 번째 점의 y 좌표
 * @returns {number} 두 점 사이의 유클리드 거리
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * 두 점을 이용해 각도 계산 함수 (라디안 단위)
 * 
 * @param {number} x1 - 첫 번째 점의 x 좌표
 * @param {number} y1 - 첫 번째 점의 y 좌표
 * @param {number} x2 - 두 번째 점의 x 좌표
 * @param {number} y2 - 두 번째 점의 y 좌표
 * @returns {number} 두 점 사이의 각도 (라디안)
 */
export const calculateAngle = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * 얼굴 분석 박스 그리기 함수
 * 
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 * @param {number} boxX - 박스 시작 X 좌표
 * @param {number} boxY - 박스 시작 Y 좌표
 * @param {number} boxWidth - 박스 너비
 * @param {number} boxHeight - 박스 높이
 * @param {FaceFeatures} faceFeatures - 얼굴 특성 데이터
 */
export const drawFaceAnalysisBox = (
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  faceFeatures: FaceFeatures
): void => {
  // 분석 박스 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  
  // 박스 제목
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('얼굴 분석 결과', boxX + boxWidth / 2, boxY + 20);
  
  // 특성 표시 간격 계산
  const featureCount = 6; // 표시할 특성 수
  const startY = 0.15; // 시작 위치 (전체 높이 대비 비율)
  const interval = 0.12; // 각 항목 간 간격 (전체 높이 대비 비율)
  
  // 얼굴 비율 정보
  drawFeatureBar(
    "얼굴 비율:", 
    Math.min(1, faceFeatures.faceRatio / 2), 
    faceFeatures.faceRatio.toFixed(2), 
    startY, 
    boxX, boxY, boxWidth, boxHeight, 
    ctx
  );
  
  // 대칭성 점수
  drawFeatureBar(
    "대칭성:", 
    faceFeatures.symmetryScore, 
    `${(faceFeatures.symmetryScore * 100).toFixed(1)}%`, 
    startY + interval, 
    boxX, boxY, boxWidth, boxHeight, 
    ctx
  );
  
  // 눈 정보
  drawFeatureBar(
    "눈 너비:", 
    Math.min(1, (faceFeatures.eyeWidth_L + faceFeatures.eyeWidth_R) / 2 * 10), 
    ((faceFeatures.eyeWidth_L + faceFeatures.eyeWidth_R) / 2).toFixed(2), 
    startY + interval * 2, 
    boxX, boxY, boxWidth, boxHeight, 
    ctx
  );
  
  // 눈 각도 차이
  const eyeAngleDiff = Math.abs(faceFeatures.eyeAngleDeg_L! - faceFeatures.eyeAngleDeg_R!);
  drawFeatureBar(
    "눈 각도 차이:", 
    Math.max(0, 1 - eyeAngleDiff / 10), // 차이가 작을수록 높은 점수
    `${eyeAngleDiff.toFixed(1)}°`, 
    startY + interval * 3, 
    boxX, boxY, boxWidth, boxHeight, 
    ctx
  );
  
  // 코 높이
  drawFeatureBar(
    "코 높이:", 
    Math.min(1, faceFeatures.noseHeight * 5), 
    faceFeatures.noseHeight.toFixed(2), 
    startY + interval * 4, 
    boxX, boxY, boxWidth, boxHeight, 
    ctx
  );
  
  // 콧망울 대칭성
  const nostrilSymmetry = 1 - Math.abs(faceFeatures.nostrilSize_L - faceFeatures.nostrilSize_R) / 
                           Math.max(faceFeatures.nostrilSize_L, faceFeatures.nostrilSize_R);
  drawFeatureBar(
    "콧망울 대칭:", 
    nostrilSymmetry, 
    `${(nostrilSymmetry * 100).toFixed(1)}%`, 
    startY + interval * 5, 
    boxX, boxY, boxWidth, boxHeight, 
    ctx
  );
};

/**
 * 코 높이를 시각적으로 나타내는 지표 그리기
 */
export const drawNoseHeightIndicator = (
  ctx: CanvasRenderingContext2D,
  faceLandmarks: any,
  faceFeatures: FaceFeatures
): void => {
  // 캔버스 크기
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // 코 끝과 눈 사이 랜드마크 인덱스
  const noseIndex = 1; // 코 끝
  const betweenEyesIndex = 168; // 눈 사이
  
  // 좌표 계산 (캔버스 크기에 맞게 조정)
  const noseTipX = faceLandmarks[noseIndex].x * canvasWidth;
  const noseTipY = faceLandmarks[noseIndex].y * canvasHeight;
  const betweenEyesX = faceLandmarks[betweenEyesIndex].x * canvasWidth;
  const betweenEyesY = faceLandmarks[betweenEyesIndex].y * canvasHeight;
  
  // 코 높이 시각화를 위한 수직선
  ctx.beginPath();
  ctx.moveTo(noseTipX, noseTipY);
  ctx.lineTo(noseTipX, betweenEyesY);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 코 높이 텍스트
  const heightText = `${faceFeatures.noseHeight.toFixed(2)}`;
  
  // 코 끝에 원과 함께 텍스트 표시
  drawCircleWithText(ctx, noseTipX, noseTipY, heightText);
};

/**
 * 픽셀 색상 추출 함수
 */
export const getPixelColor = (landmarks: any, index: number, canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#000000';
  
  const x = Math.floor(landmarks[index].x * canvas.width);
  const y = Math.floor(landmarks[index].y * canvas.height);
  
  try {
    // 해당 픽셀의 RGBA 값 가져오기
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    // RGB 값을 16진수 색상 코드로 변환
    return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
  } catch (e) {
    console.error('픽셀 색상 추출 오류:', e);
    return '#000000';
  }
}; 