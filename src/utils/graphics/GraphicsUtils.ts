/**
 * 그래픽 유틸리티 함수 모음
 * 캔버스 렌더링 관련 함수들의 집합입니다.
 * @module GraphicsUtils
 */

/**
 * 둥근 모서리 사각형 그리기 함수
 * 
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 * @param {number} x - 사각형 시작 X 좌표
 * @param {number} y - 사각형 시작 Y 좌표
 * @param {number} width - 사각형 너비
 * @param {number} height - 사각형 높이
 * @param {number} radius - 모서리 반경
 */
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
): void => {
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

/**
 * 왼쪽 모서리만 둥근 사각형 그리기 함수
 * 
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 * @param {number} x - 사각형 시작 X 좌표
 * @param {number} y - 사각형 시작 Y 좌표
 * @param {number} width - 사각형 너비
 * @param {number} height - 사각형 높이
 * @param {number} radius - 모서리 반경
 */
export const drawLeftRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
): void => {
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

/**
 * 텍스트를 둘러싼 원 그리기
 * 
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 * @param {number} x - 원 중심 X 좌표
 * @param {number} y - 원 중심 Y 좌표
 * @param {string} text - 표시할 텍스트
 * @param {'circle' | 'smallCircle'} style - 원 스타일 ('circle' 또는 'smallCircle')
 * @param {boolean} isLeft - 왼쪽 요소인지 여부 (색상 결정에 사용)
 * @param {string | null} customColor - 사용자 지정 색상 (제공시 기본 색상 대신 사용)
 */
export const drawCircleWithText = (
  ctx: CanvasRenderingContext2D,
  x: number, 
  y: number, 
  text: string, 
  style: 'circle' | 'smallCircle' = 'circle', 
  isLeft: boolean = true, 
  customColor: string | null = null
): void => {
  // 원 크기 설정
  const radius = style === 'circle' ? 20 : 15;
  
  // 배경 색상 설정
  ctx.fillStyle = customColor || (isLeft ? 'rgba(48, 255, 48, 0.6)' : 'rgba(255, 48, 48, 0.6)');
  
  // 원 그리기
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // 텍스트 스타일 설정
  ctx.fillStyle = '#FFFFFF';
  ctx.font = style === 'circle' ? 'bold 11px Arial' : 'bold 9px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 텍스트 그리기
  ctx.fillText(text, x, y);
};

/**
 * 특성 바를 박스 내부에 그리는 함수
 * 
 * @param {string} label - 바 레이블
 * @param {number} value - 바 값 (0-1 사이)
 * @param {string} displayValue - 표시할 값 텍스트
 * @param {number} position - 바의 상대적 수직 위치 (0-1 사이)
 * @param {number} boxX - 외부 박스 X 좌표
 * @param {number} boxY - 외부 박스 Y 좌표
 * @param {number} boxWidth - 외부 박스 너비
 * @param {number} boxHeight - 외부 박스 높이
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 */
export const drawFeatureBar = (
  label: string,
  value: number,
  displayValue: string,
  position: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  ctx: CanvasRenderingContext2D
): void => {
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
    return; // 그래프를 표시하지 않고 함수 종료
  }
  
  // 그래프 바 크기 및 위치 계산
  const barY = boxY + boxHeight * position - 7;
  const barHeight = 10;
  const barWidth = boxWidth - 170;
  const barRadius = 5; // 바의 border-radius
  
  // 바 배경 그리기 (라운딩 적용)
  ctx.fillStyle = '#333333';
  drawRoundedRect(ctx, boxX + 90, barY, barWidth, barHeight, barRadius);
  
  // 값에 따른 바 너비 계산
  let fillWidth = barWidth * value;
  
  // 바 너비가 최소 픽셀 크기보다 작으면 최소 크기로 설정
  const MIN_PIXEL_WIDTH = 10; // 최소 픽셀 너비 (10픽셀)
  if (fillWidth < MIN_PIXEL_WIDTH && value > 0) {
    fillWidth = MIN_PIXEL_WIDTH;
  } else if (value <= 0) {
    return; // 채우기 값이 없으면 배경만 그리고 종료
  }
  
  // 바 채우기 (라운딩 적용)
  ctx.fillStyle = '#75C076'; // 연두색
  
  // 채워지는 너비가 전체 너비보다 작은 경우 왼쪽 모서리만 둥글게
  if (fillWidth < barWidth) {
    // 왼쪽 모서리가 둥글고 오른쪽은 직선인 사각형 그리기
    drawLeftRoundedRect(ctx, boxX + 90, barY, fillWidth, barHeight, barRadius);
  } else {
    // 양쪽 모서리가 모두 둥근 사각형 그리기
    drawRoundedRect(ctx, boxX + 90, barY, fillWidth, barHeight, barRadius);
  }
};

/**
 * 색상에 따라 텍스트 색상을 조정하는 함수
 * 밝은 배경은 어두운 텍스트, 어두운 배경은 밝은 텍스트를 반환합니다.
 * 
 * @param {string} hexcolor - 16진수 색상 코드 (# 포함 또는 미포함)
 * @returns {string} 'black' 또는 'white' (대비되는 색상)
 */
export const getContrastYIQ = (hexcolor: string): string => {
  // '#'로 시작하면 제거
  hexcolor = hexcolor.replace(/^#/, '');
  
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}; 