import React from 'react';

// FaceFeatures 인터페이스 정의 및 내보내기
export interface FaceFeatures {
  faceWidth: number;
  faceHeight: number;
  noseHeight: number;
  noseLength: number;
  nostrilSize_L: number;
  nostrilSize_R: number;
  leftEyeAngle: number;
  rightEyeAngle: number;
  fWHR: number;
  fSR: number;
  faceRatio?: number;
  symmetryScore?: number;
  eyeDistance?: number;
  faceWidthPixels?: number;
  eyeAngleDeg_L?: number;
  eyeAngleDeg_R?: number;
  lowerLipThickness?: number;
  leftEyeColor?: string;
  rightEyeColor?: string;
  eyeIrisColor_L?: string; // WebcamDetection에서 추출한 눈동자 색상
  eyeIrisColor_R?: string; // WebcamDetection에서 추출한 눈동자 색상
  eyeDarkCircleColor?: string; // 다크서클 색상
  skinToneColor?: string; // 피부 색상 HEX 코드
  showDeviceInfo?: boolean; // 디바이스 정보 표시 여부
  displayNoseHeight?: number;
  displayNoseLength?: number;
  displayLowerLipThickness?: number;
  [key: string]: number | string | boolean | undefined;
}

interface FaceFeatureBarProps {
  label: string;
  value: number;
  displayValue: string;
  position: number; // 0~1 사이의 위치 (높이 비율)
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  ctx: CanvasRenderingContext2D;
}

interface FaceAnalysisBoxProps {
  ctx: CanvasRenderingContext2D;
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  faceFeatures: any;
}

// 디바이스 유형 감지 함수
export const detectDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'iOS';
  } else if (/android/.test(userAgent)) {
    return 'Android';
  } else {
    return 'PC';
  }
};

// 현재 디바이스 타입
const deviceType = detectDeviceType();

// 둥근 모서리 사각형 그리기 함수
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// 왼쪽 모서리만 둥근 사각형 그리기 함수
const drawLeftRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// 박스 내부에 특성 바를 그리는 함수
const drawFeatureBar = ({
  label,
  value,
  displayValue,
  position,
  boxX,
  boxY,
  boxWidth,
  boxHeight,
  ctx
}: FaceFeatureBarProps) => {
  // 글자 스타일 설정
  ctx.font = 'bold 12px Arial';
  ctx.textBaseline = 'middle';
  
  // 라벨 표시
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(label, boxX + 20, boxY + boxHeight * position);
  
  // 값 표시
  ctx.textAlign = 'right';
  ctx.fillText(displayValue, boxX + boxWidth - 20, boxY + boxHeight * position);
  
  // 그래프 표시 여부 결정을 위한 임계값
  const MIN_GRAPH_WIDTH = 220; // 그래프 표시에 필요한 최소 박스 너비 (픽셀)
  
  // 텍스트만 표시할지 결정
  const showGraphsOnly = boxWidth >= MIN_GRAPH_WIDTH;
  
  // 텍스트 표시 후 이 시점에서 그래프 표시 여부 결정
  if (!showGraphsOnly) {
    console.log('Box too small, hiding graphs. Width:', boxWidth);
    return; // 그래프를 표시하지 않고 함수 종료
  }
  
  // 여기서부터는 그래프를 그리는 코드 - 박스 크기가 충분할 때만 실행됨
  
  // 그래프 바 크기 및 위치 계산
  const barY = boxY + boxHeight * position - 7;
  const barHeight = 10;
  const barWidth = boxWidth - 170;
  const barRadius = 5; // 바의 border-radius
  
  // 바 배경 그리기 (라운딩 적용)
  ctx.fillStyle ='rgba(255, 255, 255, 0.2)';
  drawRoundedRect(ctx, boxX + 90, barY, barWidth, barHeight, barRadius);
  
  // 라벨에 따라 다른 최대값 적용
  let maxValue = 1.0; // 기본값 (fSR 등 다른 지표용)
  
  // fWHR인 경우 디바이스 타입에 따라 최대값 설정
  if (label === 'fWHR') {
    const deviceType = detectDeviceType();
    if (deviceType === 'iOS' || deviceType === 'Android') {
      maxValue = 2.5; // 모바일에서는 2.5 최대값 사용
    } else {
      maxValue = 3.0; // PC에서는 3.0 최대값 사용
    }
  }
  
  // 값에 따른 바 너비 계산 - 라벨별 최대값 적용
  let fillWidth = barWidth * (value / maxValue);
  
  // 바 너비가 최소 픽셀 크기보다 작으면 최소 크기로 설정
  const MIN_PIXEL_WIDTH = 10; // 최소 픽셀 너비 (10픽셀)
  if (fillWidth < MIN_PIXEL_WIDTH && value > 0) {
    fillWidth = MIN_PIXEL_WIDTH;
  } else if (value <= 0) {
    return; // 채우기 값이 없으면 배경만 그리고 종료
  }
  
  // 바 채우기 (라운딩 적용)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // 연두색
  
  // 채워지는 너비가 전체 너비보다 작은 경우 왼쪽 모서리만 둥글게
  if (fillWidth < barWidth) {
    // 왼쪽 모서리가 둥글고 오른쪽은 직선인 사각형 그리기
    drawLeftRoundedRect(ctx, boxX + 90, barY, fillWidth, barHeight, barRadius);
  } else {
    // 양쪽 모서리가 모두 둥근 사각형 그리기
    drawRoundedRect(ctx, boxX + 90, barY, fillWidth, barHeight, barRadius);
  }
};

// 코 등에 세로로 긴 흰 박스를 그리는 함수
const drawNoseVerticalBox = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  canvasWidth: number,
  canvasHeight: number,
  faceFeatures: any,
  scale: number = 1.0,
  noseLengthText: string
) => {
  // 코 관련 랜드마크 인덱스
  const noseIndex = 1; // 코 끝
  const betweenEyesIndex = 168; // 눈 사이
  
  // 좌표 계산 (반전 적용)
  const noseTipX = canvasWidth - (landmarks[noseIndex].x * canvasWidth);
  const noseTipY = landmarks[noseIndex].y * canvasHeight;
  const betweenEyesX = canvasWidth - (landmarks[betweenEyesIndex].x * canvasWidth);
  const betweenEyesY = landmarks[betweenEyesIndex].y * canvasHeight;
  
  // 박스 속성 계산
  const boxWidth = 30 * scale; // 박스 너비
  const circleRadius = 20 * scale; // 코 원의 반지름 (drawCircleWithText 함수에서 사용한 값과 동일)
  
  // 코 끝과 눈 사이의 거리 계산
  const distanceY = Math.abs(noseTipY - betweenEyesY);
  
  // 박스 시작점 (코 끝에서 원의 크기만큼 위로 올라가서 시작)
  const boxStartY = noseTipY - circleRadius - 10; // 원과 약간 간격 두기
  
  // 박스 끝점 (눈 사이까지)
  const boxEndY = betweenEyesY;
  
  // 박스 높이 (원 크기를 고려하여 조정)
  const boxHeight = boxEndY - boxStartY;
  
  // 박스 그리기 (세로로 긴 흰색 반투명 박스)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // 흰색 반투명
  
  // 둥근 모서리 사각형 그리기
  const cornerRadius = 0 * scale; // 모서리 둥글기 반경
  
  ctx.beginPath();
  ctx.moveTo(noseTipX - boxWidth/2 + cornerRadius, boxStartY);
  ctx.lineTo(noseTipX + boxWidth/2 - cornerRadius, boxStartY);
  ctx.quadraticCurveTo(noseTipX + boxWidth/2, boxStartY, noseTipX + boxWidth/2, boxStartY + cornerRadius);
  ctx.lineTo(noseTipX + boxWidth/2, boxStartY + boxHeight - cornerRadius);
  ctx.quadraticCurveTo(noseTipX + boxWidth/2, boxStartY + boxHeight, noseTipX + boxWidth/2 - cornerRadius, boxStartY + boxHeight);
  ctx.lineTo(noseTipX - boxWidth/2 + cornerRadius, boxStartY + boxHeight);
  ctx.quadraticCurveTo(noseTipX - boxWidth/2, boxStartY + boxHeight, noseTipX - boxWidth/2, boxStartY + boxHeight - cornerRadius);
  ctx.lineTo(noseTipX - boxWidth/2, boxStartY + cornerRadius);
  ctx.quadraticCurveTo(noseTipX - boxWidth/2, boxStartY, noseTipX - boxWidth/2 + cornerRadius, boxStartY);
  ctx.closePath();
  ctx.fill();
  
  // 테두리 추가
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  
  // 코 길이 텍스트 표시
  ctx.font = `bold ${12 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  
  // 박스 중앙에 코 길이 텍스트 표시
  const textY = boxStartY + boxHeight / 2;
  ctx.fillText(noseLengthText, noseTipX, textY);
};

// 눈 사이에 원을 그리는 함수
const drawEyebrowHorizontalBox = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  canvasWidth: number,
  canvasHeight: number,
  faceFeatures: any,
  scale: number = 1.0
) => {
  // 눈 사이 관련 랜드마크 인덱스
  const leftEyeInnerIndex = 133; // 왼쪽 눈 안쪽 코너
  const rightEyeInnerIndex = 362; // 오른쪽 눈 안쪽 코너
  
  // 눈썹 인덱스 추가
  const leftEyebrowIndex = 66; // 왼쪽 눈썹 중간 부분
  const rightEyebrowIndex = 296; // 오른쪽 눈썹 중간 부분
  
  // 좌표 계산 (반전 적용)
  const leftEyeInnerX = canvasWidth - (landmarks[leftEyeInnerIndex].x * canvasWidth);
  const leftEyeInnerY = landmarks[leftEyeInnerIndex].y * canvasHeight;
  
  const rightEyeInnerX = canvasWidth - (landmarks[rightEyeInnerIndex].x * canvasWidth);
  const rightEyeInnerY = landmarks[rightEyeInnerIndex].y * canvasHeight;
  
  // 눈썹 위치 좌표
  const leftEyebrowY = landmarks[leftEyebrowIndex].y * canvasHeight;
  const rightEyebrowY = landmarks[rightEyebrowIndex].y * canvasHeight;
  
  // 원의 속성 계산
  const eyeDistance = Math.abs(leftEyeInnerX - rightEyeInnerX);
  const circleRadius = 20 * scale; // 원 크기
  
  // 원의 중심점 (두 눈 사이의 중간 지점)
  const circleCenterX = rightEyeInnerX + eyeDistance / 2;
  
  // Y 위치는 눈썹 Y 좌표를 사용
  const eyebrowY = (leftEyebrowY + rightEyebrowY) / 1.9;
  const circleCenterY = eyebrowY;
  
  // 원 그리기 (흰색 반투명)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // 흰색 반투명
  ctx.beginPath();
  ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // 테두리 추가
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  
  // 텍스트 스타일 설정
  ctx.font = `bold ${12 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  
  // WebcamDetection에서 계산된 눈 사이 거리 값 가져오기
  const eyeDistanceText = faceFeatures.eyeDistanceRatio ? 
    faceFeatures.eyeDistanceRatio.toFixed(2) : "1.00";
  
  // 원 중앙에 눈 사이 거리 비율 텍스트 표시
  ctx.fillText(eyeDistanceText, circleCenterX, circleCenterY);
};

// 코 끝과 콧망울에 동그라미 추가하고 값을 표시하는 함수
const drawNoseCircles = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  canvasWidth: number,
  canvasHeight: number,
  faceFeatures: any,
  scale: number = 1.0 // 거리에 따른 스케일 인자
) => {
  // 좌우 반전을 위한 캔버스 상태 저장
  ctx.save();
  
  // 1. 좌표계를 캔버스의 중심으로 이동
  ctx.translate(canvasWidth, 0);
  
  // 2. x축 방향으로 -1 스케일링 (좌우 반전)
  ctx.scale(-1, 1);
  
  // 현재 디바이스 유형 확인
  const currentDeviceType = detectDeviceType();
  
  // 디바이스 정보 표시 여부를 위한 파라미터 추가
  let showDeviceInfo = false;
  
  // 톱니바퀴 버튼 클릭 시 디바이스 정보를 표시하기 위해 WebcamDetection에서 받을 파라미터 변수
  if (faceFeatures && faceFeatures.showDeviceInfo) {
    showDeviceInfo = faceFeatures.showDeviceInfo;
  }
  
  // 디바이스 정보를 화면 가운데 명확하게 표시 (메뉴 버튼 클릭시에만 표시)
  if (showDeviceInfo) {
    // 반전된 캔버스에서 다시 원래대로 변환하여 텍스트를 정상적으로 그리기
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 변환 초기화

    const deviceInfoText = `디바이스: ${currentDeviceType}`;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 텍스트 배경 그리기
    const textWidth = ctx.measureText(deviceInfoText).width;
    const padding = 10;
    const rectX = canvasWidth / 2 - textWidth / 2 - padding;
    const rectY = 50; // 상단에 고정된 위치
    const rectWidth = textWidth + padding * 2;
    const rectHeight = 30;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    
    // 텍스트 그리기
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(deviceInfoText, canvasWidth / 2, rectY + rectHeight / 2);
    
    ctx.restore(); // 기존 변환 상태로 복원
  }
  
  // 코 관련 랜드마크 인덱스
  const noseIndex = 1; // 코 끝
  const leftNostrilIndex = 102; // 왼쪽 콧망울
  const rightNostrilIndex = 331; // 오른쪽 콧망울
  
  // 관자놀이 인덱스 (얼굴 양쪽 측면)
  const leftTempleIndex = 33; // 왼쪽 눈 외측 끝 (왼쪽 눈 옆)
  const rightTempleIndex = 263; // 오른쪽 눈 외측 끝 (오른쪽 눈 옆)
  
  // 입술 인덱스
  const lowerLipIndex = 15; // 아랫입술 하단 중앙
  
  // 눈 아래 인덱스
  const rightUnderEyeIndex = 253; // 오른쪽 눈 아래 지점
  
  // 좌표 계산 (반전 적용)
  const noseTipX = canvasWidth - (landmarks[noseIndex].x * canvasWidth); 
  const noseTipY = landmarks[noseIndex].y * canvasHeight;
  
  const leftNostrilX = canvasWidth - (landmarks[leftNostrilIndex].x * canvasWidth);
  const leftNostrilY = landmarks[leftNostrilIndex].y * canvasHeight;
  
  const rightNostrilX = canvasWidth - (landmarks[rightNostrilIndex].x * canvasWidth);
  const rightNostrilY = landmarks[rightNostrilIndex].y * canvasHeight;
  
  // 관자놀이 좌표 계산 (반전 적용)
  const leftTempleX = canvasWidth - (landmarks[leftTempleIndex].x * canvasWidth) + 40; // 얼굴 왼쪽으로 이동 (화면에서는 오른쪽)
  const leftTempleY = landmarks[leftTempleIndex].y * canvasHeight;
  
  const rightTempleX = canvasWidth - (landmarks[rightTempleIndex].x * canvasWidth) - 40; // 얼굴 오른쪽으로 이동 (화면에서는 왼쪽)
  const rightTempleY = landmarks[rightTempleIndex].y * canvasHeight;
  
  // 관자놀이 바깥쪽 추가 원 좌표 계산
  const outerLeftTempleX = leftTempleX + 35; // 왼쪽 관자놀이 원보다 더 바깥쪽으로
  const outerLeftTempleY = leftTempleY;
  
  const outerRightTempleX = rightTempleX - 35; // 오른쪽 관자놀이 원보다 더 바깥쪽으로
  const outerRightTempleY = rightTempleY;
  
  // 오른쪽 눈 아래 추가 원 좌표 계산 (관자놀이 아래에 위치)
  const rightUnderEyeX = rightTempleX;
  const rightUnderEyeY = rightTempleY + 40; // 관자놀이 원 아래로 40픽셀
  
  // 오른쪽 중간 원 좌표 계산 (두 원 사이 중간 지점)
  const rightMiddleX = rightTempleX - 30; // 관자놀이 원보다 더 바깥쪽으로
  const rightMiddleY = rightTempleY + 30; // 관자놀이와 눈 아래 원 사이지만 약간 더 아래로
  
  // 아랫입술 좌표 계산 (반전 적용)
  const lowerLipX = canvasWidth - (landmarks[lowerLipIndex].x * canvasWidth);
  const lowerLipY = landmarks[lowerLipIndex].y * canvasHeight + 15; // 15픽셀 아래로 이동
  
  // 디바이스 유형에 따라 다른 표시 텍스트 생성
  let devicePrefix = '';
  if (currentDeviceType === 'iOS' || currentDeviceType === 'Android') {
    // devicePrefix = '[M] '; // 모바일 표시용 접두사
  }
  
  // 값 텍스트 준비 - 이미 플랫폼별로 계산된 값들을 사용
  const noseHeightText = `${devicePrefix}${(faceFeatures.displayNoseHeight || faceFeatures.noseHeight).toFixed(2)}`;
  const noseLengthText = faceFeatures.displayNoseLength ? 
    `${devicePrefix}${faceFeatures.displayNoseLength.toFixed(2)}` : 
    `${devicePrefix}${(faceFeatures.noseLength || 0).toFixed(2)}`;
  const leftNostrilText = faceFeatures.nostrilSize_L.toFixed(2);
  const rightNostrilText = faceFeatures.nostrilSize_R.toFixed(2);
  
  // 관자놀이 관련 값 텍스트 - 왼쪽/오른쪽 눈 각도 사용 (실제 각도 표시)
  const leftTempleText = faceFeatures.eyeAngleDeg_L ? `${faceFeatures.eyeAngleDeg_L.toFixed(1)}°` : "0.0°";
  const rightTempleText = faceFeatures.eyeAngleDeg_R ? `${faceFeatures.eyeAngleDeg_R.toFixed(1)}°` : "0.0°";
  
  // 입술 관련 값 텍스트 - 이미 플랫폼별로 계산된 값 사용
  const lowerLipText = faceFeatures.displayLowerLipThickness ? 
    `${devicePrefix}${faceFeatures.displayLowerLipThickness.toFixed(2)}` : 
    `${devicePrefix}${(faceFeatures.lowerLipThickness || 0).toFixed(2)}`;
  
  // 눈 색상 가져오기 (기본값은 갈색)
  const leftEyeColor = faceFeatures.eyeIrisColor_L || 'rgba(101, 67, 33, 0.9)'; // WebcamDetection에서 추출한 색상 사용
  const rightEyeColor = faceFeatures.eyeIrisColor_R || 'rgba(101, 67, 33, 0.9)'; // WebcamDetection에서 추출한 색상 사용
  const darkCircleColor = faceFeatures.eyeDarkCircleColor || '#472D22'; // 다크서클 색상
  const skinToneColor = faceFeatures.skinToneColor || '#E8C4A2'; // 피부 색상 (기본 밝은 베이지)
  
  // 스타일 설정 (원하는 스타일로 조정 가능)
  const styles = {
    // 원 스타일
    circle: {
      radius: 20 * scale, // 원 크기 (거리에 따라 조절)
      fillColor: 'rgba(255, 255, 255, 0.2)', // 흰색 배경
      strokeColor: 'rgba(255, 255, 255, 0.3)', // 빨간색 테두리
      lineWidth: 1 * scale, // 테두리 두께 (거리에 따라 조절)
    },
    // 작은 원 스타일 (관자놀이 바깥쪽 추가 원)
    smallCircle: {
      radius: 15 * scale, // 원 크기 (본 원보다 작게)
      fillColor: 'rgba(255, 255, 255, 0.2)', // 흰색 배경
      strokeColor: 'rgba(255, 255, 255, 0.3)', // 테두리
      lineWidth: 1 * scale, // 테두리 두께
      innerCircle: {
        radius: 10 * scale, // 내부 원 크기
        fillColor: 'rgba(255, 255, 255, 0.8)', // 기본 색상 (각 눈 색상으로 대체됨)
      }
    },
    // 텍스트 스타일
    text: {
      font: `bold ${12 * scale}px Arial`, // 폰트 크기도 거리에 따라 조절
      fillColor: '#FFFFFF', // 검정색 텍스트
      shadowColor: 'rgba(255, 255, 255, 0.0)',
      shadowBlur: 2 * scale,
    },
  };
  
  // 임계값 설정 (스케일이 0.7 미만이면 컴포넌트 숨김)
  const MIN_SCALE = 0.6;
  if (scale < MIN_SCALE) {
    ctx.restore(); // 캔버스 상태 복원
    return; // 그리지 않고 종료
  }
  
  // 코 등에 세로로 긴 흰 박스 그리기 (코 길이 텍스트 전달)
  drawNoseVerticalBox(ctx, landmarks, canvasWidth, canvasHeight, faceFeatures, scale, noseLengthText);
  
  // 눈 사이에 원을 그리는 함수
  drawEyebrowHorizontalBox(ctx, landmarks, canvasWidth, canvasHeight, faceFeatures, scale);
  
  // 동그라미 그리기 함수
  const drawCircleWithText = (x: number, y: number, text: string, style: 'circle' | 'smallCircle' = 'circle', isLeft: boolean = true, useCustomColor: string | null = null) => {
    // 스타일 선택
    const circleStyle = style === 'circle' ? styles.circle : styles.smallCircle;
    
    // 원 그리기 (배경)
    ctx.beginPath();
    ctx.arc(x, y, circleStyle.radius, 0, 2 * Math.PI);
    ctx.fillStyle = circleStyle.fillColor;
    ctx.fill();
    
    // 테두리 추가
    ctx.strokeStyle = circleStyle.strokeColor;
    ctx.lineWidth = circleStyle.lineWidth;
    ctx.stroke();
    
    // 작은 원일 경우 내부에 더 작은 눈동자 색상 원 추가
    if (style === 'smallCircle') {
      ctx.beginPath();
      ctx.arc(x, y, styles.smallCircle.innerCircle.radius, 0, 2 * Math.PI);
      // 사용자 정의 색상이 있으면 그 색상을 사용하고, 없으면 왼쪽/오른쪽 눈동자 색상 선택
      if (useCustomColor) {
        ctx.fillStyle = useCustomColor;
      } else {
        ctx.fillStyle = isLeft ? leftEyeColor : rightEyeColor;
      }
      ctx.fill();
    }
    
    // 텍스트 스타일 설정
    ctx.font = styles.text.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 텍스트 그림자 효과 추가
    ctx.shadowColor = styles.text.shadowColor;
    ctx.shadowBlur = styles.text.shadowBlur;
    
    // 텍스트 그리기
    ctx.fillStyle = styles.text.fillColor;
    if (text) {
      ctx.fillText(text, x, y);
    }
    
    // 그림자 효과 초기화
    ctx.shadowBlur = 0;
  };
  
  // 코 끝 동그라미 그리기 (코 높이 값 표시)
  drawCircleWithText(noseTipX, noseTipY, noseHeightText);
  
  // 왼쪽 콧망울 동그라미 그리기
  drawCircleWithText(leftNostrilX, leftNostrilY, leftNostrilText);
  
  // 오른쪽 콧망울 동그라미 그리기
  drawCircleWithText(rightNostrilX, rightNostrilY, rightNostrilText);
  
  // 왼쪽 관자놀이 동그라미 그리기
  drawCircleWithText(leftTempleX, leftTempleY, leftTempleText);
  
  // 오른쪽 관자놀이 동그라미 그리기
  drawCircleWithText(rightTempleX, rightTempleY, rightTempleText);
  
  // 왼쪽 관자놀이 바깥쪽 추가 동그라미 그리기 (작은 원)
  drawCircleWithText(outerLeftTempleX, outerLeftTempleY, '', 'smallCircle', true);
  
  // 오른쪽 관자놀이 바깥쪽 추가 동그라미 그리기 (작은 원)
  drawCircleWithText(outerRightTempleX, outerRightTempleY, '', 'smallCircle', false);
  
  // 오른쪽 눈 아래 추가 동그라미 그리기 (작은 원) - 다크서클 색상 사용
  drawCircleWithText(rightUnderEyeX, rightUnderEyeY, '', 'smallCircle', false, darkCircleColor);
  
  // 오른쪽 중간 추가 동그라미 그리기 (작은 원) - 피부색 사용
  drawCircleWithText(rightMiddleX, rightMiddleY, '', 'smallCircle', false, skinToneColor);
  
  // 아랫입술 동그라미 그리기
  drawCircleWithText(lowerLipX, lowerLipY, lowerLipText);
  
  // 캔버스 상태 복원 (변환 제거)
  ctx.restore();
};

// 얼굴 분석 박스 그리기 함수
export const drawFaceAnalysisBox = ({
  ctx,
  boxX,
  boxY,
  boxWidth,
  boxHeight,
  faceFeatures
}: FaceAnalysisBoxProps) => {
  if (!ctx || !faceFeatures) return;
  
  // 현재 캔버스 상태 저장
  ctx.save();
  
  // 좌우 반전을 위한 변환 적용
  // 캔버스의 중심을 기준으로 반전
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // 1. 좌표계를 캔버스의 중심으로 이동
  ctx.translate(canvasWidth, 0);
  
  // 2. x축 방향으로 -1 스케일링 (좌우 반전)
  ctx.scale(-1, 1.05);
  
  // 원래 좌표에서 반전된 좌표 계산
  const flippedBoxX = canvasWidth - boxX - boxWidth;
  
  // 최소 박스 표시 임계값 설정
  const MIN_BOX_HEIGHT = 20; // 최소 박스 높이 (픽셀)
  
  // 박스 크기가 너무 작으면 전체 박스를 표시하지 않음
  if (boxHeight < MIN_BOX_HEIGHT) {
    ctx.restore();
    return;
  }
  
  // 블러 효과는 캔버스 API 한계로 직접적으로 구현하기 어려우므로 대신 반투명 효과 강화
  
  // 모서리 반경
  const cornerRadius = 10;
  
  // 박스 배경 (반투명 검정색 + 라운딩)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // 불투명도 높임
  drawRoundedRect(ctx, flippedBoxX, boxY, boxWidth, boxHeight, cornerRadius);
  
  // 박스 테두리 (라운딩 적용)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(flippedBoxX + cornerRadius, boxY);
  ctx.lineTo(flippedBoxX + boxWidth - cornerRadius, boxY);
  ctx.quadraticCurveTo(flippedBoxX + boxWidth, boxY, flippedBoxX + boxWidth, boxY + cornerRadius);
  ctx.lineTo(flippedBoxX + boxWidth, boxY + boxHeight - cornerRadius);
  ctx.quadraticCurveTo(flippedBoxX + boxWidth, boxY + boxHeight, flippedBoxX + boxWidth - cornerRadius, boxY + boxHeight);
  ctx.lineTo(flippedBoxX + cornerRadius, boxY + boxHeight);
  ctx.quadraticCurveTo(flippedBoxX, boxY + boxHeight, flippedBoxX, boxY + boxHeight - cornerRadius);
  ctx.lineTo(flippedBoxX, boxY + cornerRadius);
  ctx.quadraticCurveTo(flippedBoxX, boxY, flippedBoxX + cornerRadius, boxY);
  ctx.stroke();
  
  // fWHR (얼굴 너비-높이 비율) 표시
  const faceRatioValue = faceFeatures.faceRatio || 0.5; // 값이 없으면 기본값 설정
  
  // 디바이스 유형 확인하여 접두사 추가
  const boxDeviceType = detectDeviceType();
  let fwhrPrefix = '';
  if (boxDeviceType === 'iOS' || boxDeviceType === 'Android') {
    // fwhrPrefix = '[M] '; // 모바일 표시용 접두사
  }
  
  // 이미 플랫폼별로 계산된 displayFaceRatio 값을 직접 사용
  const displayRatio = faceFeatures.displayFaceRatio ? 
    faceFeatures.displayFaceRatio.toFixed(2) : 
    "0.70"; // fallback
  
  const displayRatioText = `${fwhrPrefix}${displayRatio}`;
  
  // 실시간 fWHR 값을 적용하여 그래프 그리기
  drawFeatureBar({
    label: 'fWHR',
    value: faceRatioValue, // 그래프 표시용 원본 값은 유지
    displayValue: displayRatioText,
    position: 0.33,
    boxX: flippedBoxX,
    boxY,
    boxWidth,
    boxHeight,
    ctx
  });
  
  // fSR (얼굴 대칭성) 표시
  const symmetryValue = faceFeatures.symmetryScore;
  
  // 이미 플랫폼별로 계산된 displaySymmetryScore 값을 직접 사용
  const displaySymmetryPercent = faceFeatures.displaySymmetryScore ? 
    faceFeatures.displaySymmetryScore.toFixed(0) : 
    "85"; // fallback
  
  const displaySymmetryText = `${fwhrPrefix}${displaySymmetryPercent}%`;
  
  drawFeatureBar({
    label: 'fSR',
    value: symmetryValue, // 그래프 표시용 원본 값은 유지
    displayValue: displaySymmetryText,
    position: 0.67,
    boxX: flippedBoxX,
    boxY,
    boxWidth,
    boxHeight,
    ctx
  });
  
  // 캔버스 상태 복원 (변환 제거)
  ctx.restore();
};

// 코 끝에 동그라미와 코 높이를 표시하는 함수 내보내기
export const drawNoseHeightIndicator = (
  ctx: CanvasRenderingContext2D,
  faceLandmarks: any,
  faceFeatures: any
) => {
  if (!ctx || !faceLandmarks || !faceFeatures || faceLandmarks.length === 0) return;
  
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // 얼굴 크기 기반으로 스케일 계산 (얼굴 랜드마크에서 계산)
  // faceWidthPixels가 없으면 랜드마크에서 계산
  let scale = 1.0;
  
  // 얼굴 랜드마크에서 직접 얼굴 너비 계산
  if (!faceFeatures.faceWidthPixels) {
    const landmarks = faceLandmarks[0];
    let minX = canvasWidth;
    let maxX = 0;
    
    // 얼굴 랜드마크를 순회하며 좌우 경계 찾기
    for (const landmark of landmarks) {
      const x = landmark.x * canvasWidth;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
    
    const faceWidth = maxX - minX;
    const baseWidth = 300; // 기준 얼굴 너비 (픽셀)
    scale = Math.min(Math.max(faceWidth / baseWidth, 0.5), 1.5); // 0.5~1.5 범위로 제한
  } else {
    // faceFeatures에서 미리 계산된 값 사용
    const baseWidth = 300; // 기준 얼굴 너비 (픽셀)
    scale = Math.min(Math.max(faceFeatures.faceWidthPixels / baseWidth, 0.5), 1.5);
  }
  
  // 기기 유형에 따라 다른 표준 비율 적용 - 아니요, 모든 기기에서 동일한 기준 사용
  const standardNoseHeightRatio = 0.6; // 모든 디바이스에서 동일한 값 사용
  const standardNoseLengthRatio = 0.5; // 모든 디바이스에서 동일한 값 사용
  
  // 화면 너비에 따른 스케일 계수 적용 - 모든 디바이스에서 동일하게 처리
  const screenWidthFactor = Math.min(1, window.innerWidth / 1024);   // 모든 디바이스에서 동일하게 적용
  
  // 모든 디바이스에서 동일한 계산 사용
  const adjustedNoseHeight = faceFeatures.noseHeight * screenWidthFactor;
  
  // 전방/후방 카메라 감지 및 보정 값 적용
  const isFrontCamera = true; // 실제 카메라 유형 감지 로직 필요
  const cameraAdjustment = 1.0; // 모든 카메라에서 동일하게 처리
  
  // 새 함수 호출하여 모든 코 관련 동그라미 그리기
  drawNoseCircles(
    ctx,
    faceLandmarks[0], // 첫 번째 얼굴의 랜드마크
    canvasWidth,
    canvasHeight,
    faceFeatures,
    scale
  );
};

// 추가 얼굴 분석 기능을 위한 함수들을 여기에 추가할 수 있습니다.
// 예: 눈 각도, 코 길이, 입술 두께 등의 분석 결과를 표시하는 박스

const FaceAnalysisUtils = {
  drawFaceAnalysisBox,
  drawNoseHeightIndicator
};

export default FaceAnalysisUtils;

// Face 특성을 계산하는 함수 추가
export const calculateFaceFeatures = (landmarks: any) => {
  if (!landmarks || landmarks.length === 0) {
    return {};
  }

  // 얼굴 너비 계산 (왼쪽 귀와 오른쪽 귀 사이의 거리)
  const leftEarIndex = 234;
  const rightEarIndex = 454;
  const faceWidth = Math.abs(landmarks[leftEarIndex].x - landmarks[rightEarIndex].x);

  // 얼굴 높이 계산 (턱 끝과 이마 사이의 거리)
  const chinIndex = 152;
  const foreheadIndex = 10;
  const faceHeight = Math.abs(landmarks[foreheadIndex].y - landmarks[chinIndex].y);

  // 코 높이 계산 (코 끝과 눈 사이의 거리)
  const noseIndex = 1;
  const betweenEyesIndex = 168;
  const noseHeight = Math.abs(landmarks[noseIndex].y - landmarks[betweenEyesIndex].y);
  
  // 코 길이 계산 (코 시작점부터 코 끝까지의 곡선 거리를 근사화)
  const noseBridgeTop = 6; // 코 시작점 (코 뿌리)
  const noseLength = Math.sqrt(
    Math.pow(landmarks[noseBridgeTop].x - landmarks[noseIndex].x, 2) +
    Math.pow(landmarks[noseBridgeTop].y - landmarks[noseIndex].y, 2)
  );

  // 아랫입술 두께 계산
  const lowerLipIndex = 15; // 아랫입술 하단 중앙
  const innerLipBottomIndex = 17; // 입술 안쪽 하단 경계
  const lowerLipThickness = Math.abs(landmarks[lowerLipIndex].y - landmarks[innerLipBottomIndex].y);

  const deviceType = detectDeviceType();
  
  // 기기별 계산식 다르게 적용
  let adjustedNoseLength = noseLength;
  let adjustedNoseHeight = noseHeight;
  let adjustedLowerLipThickness = lowerLipThickness;
  let fWHR;

  if (deviceType === 'iOS' || deviceType === 'Android') {
    // 모바일 기기에서는 수정된 계산식 적용
    fWHR = faceHeight / faceWidth; // fWHR 계산식의 분자와 분모 바꿈
    adjustedNoseLength = noseLength * 3; // 코 길이 계산에 * 3
    adjustedNoseHeight = noseHeight / 3; // 코 높이 계산에 / 3
    adjustedLowerLipThickness = lowerLipThickness * 3; // 밑 입술 계산에 * 3
  } else {
    // PC에서는 기존 계산식 유지
    fWHR = faceWidth / faceHeight;
  }

  // 콧망울 크기 계산
  const leftNostrilIndex = 102;
  const rightNostrilIndex = 331;
  const nostrilSize_L = Math.abs(landmarks[noseIndex].y - landmarks[leftNostrilIndex].y);
  const nostrilSize_R = Math.abs(landmarks[noseIndex].y - landmarks[rightNostrilIndex].y);

  // 눈 각도 계산
  const leftEyeOuterIndex = 33;
  const leftEyeInnerIndex = 133;
  const rightEyeInnerIndex = 362;
  const rightEyeOuterIndex = 263;
  
  // 각도 계산 함수
  const calculateAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  };
  
  const leftEyeAngle = calculateAngle(
    landmarks[leftEyeOuterIndex].x, landmarks[leftEyeOuterIndex].y,
    landmarks[leftEyeInnerIndex].x, landmarks[leftEyeInnerIndex].y
  );
  
  const rightEyeAngle = calculateAngle(
    landmarks[rightEyeInnerIndex].x, landmarks[rightEyeInnerIndex].y,
    landmarks[rightEyeOuterIndex].x, landmarks[rightEyeOuterIndex].y
  );
  
  // 입술 각도 계산을 위한 랜드마크 인덱스
  const leftLipCornerIndex = 61;  // 왼쪽 입꼬리
  const rightLipCornerIndex = 291; // 오른쪽 입꼬리
  const upperLipMiddleIndex = 13;  // 윗입술 중앙
  
  // 왼쪽 입꼬리 각도 계산
  const leftLipAngle = calculateAngle(
    landmarks[leftLipCornerIndex].x, landmarks[leftLipCornerIndex].y,
    landmarks[upperLipMiddleIndex].x, landmarks[upperLipMiddleIndex].y
  );
  
  // 오른쪽 입꼬리 각도 계산
  const rightLipAngle = calculateAngle(
    landmarks[upperLipMiddleIndex].x, landmarks[upperLipMiddleIndex].y,
    landmarks[rightLipCornerIndex].x, landmarks[rightLipCornerIndex].y
  );
  
  // 눈썹 각도 계산을 위한 랜드마크 인덱스
  const leftEyebrowOuterIndex = 70;  // 왼쪽 눈썹 바깥쪽
  const leftEyebrowInnerIndex = 105;  // 왼쪽 눈썹 안쪽
  const rightEyebrowInnerIndex = 334; // 오른쪽 눈썹 안쪽
  const rightEyebrowOuterIndex = 300; // 오른쪽 눈썹 바깥쪽
  
  // 눈썹 각도 계산
  const leftEyebrowAngle = calculateAngle(
    landmarks[leftEyebrowOuterIndex].x, landmarks[leftEyebrowOuterIndex].y,
    landmarks[leftEyebrowInnerIndex].x, landmarks[leftEyebrowInnerIndex].y
  );
  
  const rightEyebrowAngle = calculateAngle(
    landmarks[rightEyebrowInnerIndex].x, landmarks[rightEyebrowInnerIndex].y,
    landmarks[rightEyebrowOuterIndex].x, landmarks[rightEyebrowOuterIndex].y
  );
  
  // 향상된 얼굴 좌우 대칭 점수 (fSR) 계산
  // 1. 눈 각도 차이
  const eyeAngleDiff = Math.abs(leftEyeAngle - Math.abs(rightEyeAngle));
  
  // 2. 눈썹 각도 차이
  const eyebrowAngleDiff = Math.abs(leftEyebrowAngle - Math.abs(rightEyebrowAngle));
  
  // 3. 콧망울 크기 차이
  const nostrilSizeDiff = Math.abs(nostrilSize_L - nostrilSize_R) / ((nostrilSize_L + nostrilSize_R) / 2);
  
  // 4. 입술 대칭성 (왼쪽과 오른쪽 입꼬리 각도 차이)
  const lipAngleDiff = Math.abs(leftLipAngle - Math.abs(rightLipAngle));
  
  // 가중치 부여 (각 요소의 중요도에 따라 조정)
  const eyeWeight = 0.35;       // 눈 각도의 중요도
  const eyebrowWeight = 0.2;    // 눈썹 각도의 중요도
  const nostrilWeight = 0.2;    // 콧망울 크기의 중요도
  const lipWeight = 0.25;       // 입술 각도의 중요도
  
  // 정규화된 차이값 (0~1 사이 값으로 변환)
  const normalizedEyeAngleDiff = Math.min(eyeAngleDiff / 10, 1);          // 최대 10도 차이를 1로 정규화
  const normalizedEyebrowAngleDiff = Math.min(eyebrowAngleDiff / 15, 1);  // 최대 15도 차이를 1로 정규화
  const normalizedNostrilDiff = nostrilSizeDiff;                         // 이미 비율로 계산됨
  const normalizedLipAngleDiff = Math.min(lipAngleDiff / 12, 1);         // 최대 12도 차이를 1로 정규화
  
  // 가중합으로 대칭성 점수 계산 (0에 가까울수록 대칭적, 1에 가까울수록 비대칭적)
  const asymmetryScore = 
    (eyeWeight * normalizedEyeAngleDiff) +
    (eyebrowWeight * normalizedEyebrowAngleDiff) +
    (nostrilWeight * normalizedNostrilDiff) +
    (lipWeight * normalizedLipAngleDiff);
  
  // 최종 대칭성 점수 (1에 가까울수록 대칭적, 0에 가까울수록 비대칭적)
  const fSR = 1 - asymmetryScore;
  
  // 눈 색상 추출 함수 - 실제 구현에서는 이미지 데이터를 받아서 처리해야 함
  const extractEyeColors = (video: HTMLVideoElement, landmarks: any) => {
    if (!video || !landmarks) {
      return {
        leftEyeColor: 'rgba(101, 67, 33, 0.9)',
        rightEyeColor: 'rgba(101, 67, 33, 0.9)'
      };
    }

    try {
      // 캔버스 생성하여 현재 비디오 프레임 그리기
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return {
          leftEyeColor: 'rgba(101, 67, 33, 0.9)',
          rightEyeColor: 'rgba(101, 67, 33, 0.9)'
        };
      }
      
      // 비디오 프레임을 캔버스에 그리기
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 왼쪽 눈과 오른쪽 눈의 중앙 랜드마크 인덱스
      const leftEyeIndex = 468; // 왼쪽 눈 중앙
      const rightEyeIndex = 473; // 오른쪽 눈 중앙
      
      // 눈 중앙 좌표 계산
      const leftEyeX = Math.floor(landmarks[leftEyeIndex].x * canvas.width);
      const leftEyeY = Math.floor(landmarks[leftEyeIndex].y * canvas.height);
      
      const rightEyeX = Math.floor(landmarks[rightEyeIndex].x * canvas.width);
      const rightEyeY = Math.floor(landmarks[rightEyeIndex].y * canvas.height);
      
      // 작은 샘플 영역 (3x3 픽셀) 추출하여 평균 색상 계산
      const sampleSize = 3;
      
      // 왼쪽 눈 색상 추출
      const leftEyeData = ctx.getImageData(
        leftEyeX - Math.floor(sampleSize/2), 
        leftEyeY - Math.floor(sampleSize/2), 
        sampleSize, 
        sampleSize
      ).data;
      
      // 오른쪽 눈 색상 추출
      const rightEyeData = ctx.getImageData(
        rightEyeX - Math.floor(sampleSize/2), 
        rightEyeY - Math.floor(sampleSize/2), 
        sampleSize, 
        sampleSize
      ).data;
      
      // 평균 색상 계산
      let leftR = 0, leftG = 0, leftB = 0;
      let rightR = 0, rightG = 0, rightB = 0;
      
      // 왼쪽 눈 평균 색상 계산
      for (let i = 0; i < leftEyeData.length; i += 4) {
        leftR += leftEyeData[i];
        leftG += leftEyeData[i + 1];
        leftB += leftEyeData[i + 2];
      }
      
      // 오른쪽 눈 평균 색상 계산
      for (let i = 0; i < rightEyeData.length; i += 4) {
        rightR += rightEyeData[i];
        rightG += rightEyeData[i + 1];
        rightB += rightEyeData[i + 2];
      }
      
      const pixelCount = sampleSize * sampleSize;
      leftR = Math.round(leftR / pixelCount);
      leftG = Math.round(leftG / pixelCount);
      leftB = Math.round(leftB / pixelCount);
      
      rightR = Math.round(rightR / pixelCount);
      rightG = Math.round(rightG / pixelCount);
      rightB = Math.round(rightB / pixelCount);
      
      // RGBA 형식으로 반환
      return {
        leftEyeColor: `rgba(${leftR}, ${leftG}, ${leftB}, 0.9)`,
        rightEyeColor: `rgba(${rightR}, ${rightG}, ${rightB}, 0.9)`
      };
    } catch (error) {
      console.error('Error extracting eye colors:', error);
      // 오류 발생 시 기본 색상 반환
      return {
        leftEyeColor: 'rgba(101, 67, 33, 0.9)',
        rightEyeColor: 'rgba(101, 67, 33, 0.9)'
      };
    }
  };
  
  // 비디오 요소 찾기 (실제 구현에서는 애플리케이션 컨텍스트에서 참조를 가져와야 함)
  const videoElement = document.querySelector('video');
  const { leftEyeColor, rightEyeColor } = extractEyeColors(videoElement as HTMLVideoElement, landmarks);
  
  return {
    faceWidth,
    faceHeight,
    noseHeight: adjustedNoseHeight, // 조정된 코 높이 사용
    noseLength: adjustedNoseLength, // 조정된 코 길이 사용
    nostrilSize_L,
    nostrilSize_R,
    leftEyeAngle,
    rightEyeAngle,
    fWHR,
    fSR,
    lowerLipThickness: adjustedLowerLipThickness, // 조정된 입술 두께 사용
    eyeAngleDeg_L: Math.abs(leftEyeAngle),
    eyeAngleDeg_R: Math.abs(rightEyeAngle),
    leftEyeColor,
    rightEyeColor
  };
}; 