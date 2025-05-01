/**
 * MediaPipe Face Landmarker 관련 유틸리티
 * Face Landmark 인식 및 추적을 위한 유틸리티 함수들을 제공합니다.
 * @module MediaPipeUtils
 */
import { FaceLandmarker, DrawingUtils, FilesetResolver } from '@mediapipe/tasks-vision';
import { getValueClass } from '../ui/UIUtils';
import { isMobileDevice } from '../ui/UIUtils';

let faceLandmarker: FaceLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "IMAGE";

// 값 스무딩을 위한 이전 결과 저장
let previousBlendShapeValues: { [key: string]: number } = {};

// 스무딩 계수 (0-1 사이, 높을수록 더 부드럽게 변화)
const SMOOTHING_FACTOR = 0.8;

/**
 * Face Landmarker 객체 생성 함수
 * 
 * @param {("IMAGE"|"VIDEO")} mode - 실행 모드 (이미지 또는 비디오)
 * @returns {Promise<FaceLandmarker>} 생성된 FaceLandmarker 객체
 */
export const createFaceLandmarker = async (mode: "IMAGE" | "VIDEO" = "IMAGE"): Promise<FaceLandmarker> => {
  if (faceLandmarker) {
    // 이미 생성된 faceLandmarker가 있고 모드가 다른 경우 모드 변경
    if (runningMode !== mode) {
      runningMode = mode;
      await faceLandmarker.setOptions({ runningMode });
    }
    return faceLandmarker;
  }

  // 초기 모드 설정
  runningMode = mode;

  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      // 모바일에서는 CPU 사용 (GPU는 모바일에서 성능이 더 나쁠 수 있음)
      delegate: isMobileDevice() ? "CPU" : "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
  
  return faceLandmarker;
};

/**
 * 실행 모드 설정 함수
 * 
 * @param {("IMAGE"|"VIDEO")} mode - 설정할 실행 모드
 * @returns {Promise<void>}
 */
export const setRunningMode = async (mode: "IMAGE" | "VIDEO"): Promise<void> => {
  if (!faceLandmarker) return;
  
  if (runningMode !== mode) {
    runningMode = mode;
    await faceLandmarker.setOptions({ runningMode });
    console.log(`Running mode changed to: ${mode}`);
  }
};

/**
 * 중요한 특성만 필터링하기 위한 목록
 */
export const importantBlendshapes = [
  "browDown_L", "browDown_R", "browInnerUp_L", "browInnerUp_R", "browOuterUp_L", "browOuterUp_R",
  "cheekPuff_L", "cheekPuff_R", "cheekSquint_L", "cheekSquint_R",
  "eyeBlink_L", "eyeBlink_R", "eyeSquint_L", "eyeSquint_R", "eyeWide_L", "eyeWide_R",
  "jawForward", "jawLeft", "jawRight", "jawOpen", 
  "mouthClose", "mouthFrown_L", "mouthFrown_R", "mouthSmile_L", "mouthSmile_R", "mouthDimple_L", "mouthDimple_R",
  "mouthPucker", "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper", 
  "noseSneer_L", "noseSneer_R"
];

/**
 * 얼굴 표정 특성을 HTML 요소에 그리는 함수
 * 
 * @param {HTMLElement} el - 표정 특성을 표시할 HTML 요소 
 * @param {any[]} blendShapes - MediaPipe에서 반환된 표정 특성 데이터
 */
export const drawBlendShapes = (el: HTMLElement, blendShapes: any[]): void => {
  if (!blendShapes || !blendShapes.length) {
    console.warn("No blend shapes data provided");
    return;
  }

  // 첫 번째 얼굴의 blendshapes 가져오기
  const faceBlendshapes = blendShapes[0].categories;
  if (!faceBlendshapes || faceBlendshapes.length === 0) {
    console.warn("No face blend shape categories found");
    return;
  }
  
  // 현재 요소에 항목이 없으면 초기화
  if (el.children.length === 0) {
    console.log("Initializing blend shapes UI");
    el.innerHTML = "";
    
    // 모든 데이터를 표시하도록 설정
    for (const blendshape of faceBlendshapes) {
      const container = document.createElement("li");
      container.className = "blend-shapes-item";
      container.id = `blend-shape-${blendshape.categoryName}`;

      // 레이블 생성
      const label = document.createElement("span");
      label.className = "blend-shapes-label";
      
      // 특성 이름을 사용자 친화적으로 표시
      const displayName = blendshape.categoryName
        .replace(/([A-Z])/g, ' $1') // 카멜 케이스를 스페이스로 분리
        .replace(/_([LR])$/, ' $1') // _L, _R을 공백 L, 공백 R로 변경
        .trim();
      
      label.textContent = displayName;
      container.appendChild(label);

      // 그래프 바 컨테이너 생성
      const valueContainer = document.createElement("div");
      valueContainer.className = "blend-shapes-value-container";
      
      // 그래프 바 생성
      const valueElement = document.createElement("div");
      valueElement.className = "blend-shapes-value test-low"; // 테스트용 클래스 추가
      valueElement.style.width = "0%";
      valueContainer.appendChild(valueElement);
      
      container.appendChild(valueContainer);

      // 값 텍스트 생성
      const valueText = document.createElement("span");
      valueText.className = "blend-shapes-text";
      valueText.textContent = "0.0%";
      container.appendChild(valueText);

      el.appendChild(container);
      
      // 초기 값 설정
      previousBlendShapeValues[blendshape.categoryName] = 0;
    }
    
    console.log("Created UI for", faceBlendshapes.length, "blend shapes");
  }
  
  // 모든 특성 업데이트
  for (const blendshape of faceBlendshapes) {
    const categoryName = blendshape.categoryName;
    const currentScore = blendshape.score;
    
    // 이전 값과 스무딩 적용
    let smoothedScore;
    if (runningMode === "VIDEO") {
      const previousScore = previousBlendShapeValues[categoryName] || 0;
      // 스무딩 계수 (낮을수록 반응이 더 빠름)
      const smoothingFactor = isMobileDevice() ? 0.3 : 0.5; // 더 빠른 반응을 위해 계수 낮춤
      // 부드러운 값으로 계산 (이전 값과 현재 값의 가중 평균)
      smoothedScore = previousScore * smoothingFactor + currentScore * (1 - smoothingFactor);
      // 스무딩된 새 값을 저장
      previousBlendShapeValues[categoryName] = smoothedScore;
    } else {
      // 이미지 모드에서는 스무딩 없이 직접 값 사용
      smoothedScore = currentScore;
    }
    
    // DOM 요소 찾기 및 업데이트
    const elementId = `blend-shape-${categoryName}`;
    const container = document.getElementById(elementId);
    
    if (container) {
      // 그래프 바 찾기 (새 구조에 맞게 수정)
      const valueContainer = container.querySelector(".blend-shapes-value-container");
      const valueElement = valueContainer?.querySelector(".blend-shapes-value") as HTMLElement | null;
      const valueText = container.querySelector(".blend-shapes-text") as HTMLElement | null;
      
      if (valueElement) {
        // 퍼센트 값으로 너비 설정
        const percentage = smoothedScore * 100;
        valueElement.style.width = `${percentage}%`;
        
        // 값에 따른 색상 클래스 지정 - 기존 클래스 모두 제거 후 추가
        const valueClass = getValueClass(smoothedScore);
        valueElement.classList.remove('low', 'medium', 'high');
        valueElement.classList.add(valueClass);
        
        // 데이터 속성으로도 설정 (대체 방법)
        valueElement.setAttribute('data-value', valueClass);
        
        // 직접 색상 테스트
        valueElement.classList.remove('test-low', 'test-medium', 'test-high');
        valueElement.classList.add(`test-${valueClass}`);
      }
      
      if (valueText) {
        // 소수점 한 자리까지 표시
        valueText.textContent = `${(smoothedScore * 100).toFixed(1)}%`;
      }
    }
  }
};

/**
 * 카메라 접근 가능성 체크
 * 
 * @returns {boolean} getUserMedia API가 사용 가능하면 true, 아니면 false
 */
export const hasGetUserMedia = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// DrawingUtils 클래스를 재내보내기
export { DrawingUtils };

// FaceLandmarker 클래스를 재내보내기
export { FaceLandmarker }; 