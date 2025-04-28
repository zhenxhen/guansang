/**
 * 카메라 및 영상 처리 관련 상수
 */

// 카메라 기본 설정 (DeviceConstants.ts에서 환경별 설정을 우선함)
export const CAMERA_DEFAULT = {
  WIDTH: 1280,
  HEIGHT: 720,
  ASPECT_RATIO: 16/9,
  FRAME_RATE: 30,
  FACING_MODE: 'user'
};

// 카메라 화질 옵션
export const CAMERA_QUALITY = {
  LOW: {
    WIDTH: 640,
    HEIGHT: 480,
    FRAME_RATE: 15
  },
  MEDIUM: {
    WIDTH: 1280,
    HEIGHT: 720,
    FRAME_RATE: 30
  },
  HIGH: {
    WIDTH: 1920,
    HEIGHT: 1080,
    FRAME_RATE: 30
  }
};

// 카메라 제스처 인식 설정
export const GESTURE_RECOGNITION = {
  ENABLED: true,
  CONFIDENCE_THRESHOLD: 0.7,
  DEBOUNCE_TIME: 500,  // ms
};

// 카메라 캡처 설정
export const CAPTURE_SETTINGS = {
  FORMAT: 'image/jpeg',
  QUALITY: 0.95,
  COUNTDOWN: 3,        // 초
  FLASH_DURATION: 300, // ms
  AUTO_CAPTURE: {
    ENABLED: true,
    STABILITY_THRESHOLD: 0.8,
    FACE_CENTERED_THRESHOLD: 0.85,
    MIN_DETECTION_CONFIDENCE: 0.95
  }
};

// 비디오 녹화 설정
export const RECORDING_SETTINGS = {
  MAX_DURATION: 30,    // 초
  MIME_TYPE: 'video/webm;codecs=vp9',
  BIT_RATE: 2500000,   // 비트레이트 (2.5Mbps)
  VIDEO_CONSTRAINTS: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  }
};

// 얼굴 감지 설정
export const FACE_DETECTION = {
  MODEL: 'short', // 'short' or 'full'
  MIN_CONFIDENCE: 0.9,
  MAX_FACES: 1,
  FILTER_SENSITIVITY: 0.3,
  LANDMARKS: {
    ENABLED: true,
    NUM_LANDMARKS: 468,
    MIN_CONFIDENCE: 0.75
  }
};

// 카메라 에러 메시지
export const CAMERA_ERROR_MESSAGES = {
  NOT_FOUND: '카메라를 찾을 수 없습니다.',
  NOT_ALLOWED: '카메라 접근 권한이 거부되었습니다.',
  INSECURE_CONTEXT: '보안 컨텍스트(HTTPS)에서만 카메라에 접근할 수 있습니다.',
  NOT_READABLE: '카메라를 사용할 수 없거나 이미 사용 중입니다.',
  CONSTRAINT_NOT_SATISFIED: '요청한 카메라 설정을 지원하지 않습니다.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.'
}; 