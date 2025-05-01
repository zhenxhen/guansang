/**
 * 디바이스 환경별 설정 상수
 */

// 디바이스 유형 감지
export const DEVICE_TYPE = {
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  TABLET: 'tablet'
};

// 반응형 디자인 브레이크포인트 (UIConstants.ts에서 이동)
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// 환경별 카메라 설정
export const CAMERA_SETTINGS = {
  MOBILE: {
    WIDTH: 640,
    HEIGHT: 480,
    FRAME_RATE: 15,
    FACING_MODE: 'user'
  },
  DESKTOP: {
    WIDTH: 1280,
    HEIGHT: 720,
    FRAME_RATE: 30,
    FACING_MODE: 'user'
  }
};

// 환경별 UI 설정
export const UI_SETTINGS = {
  MOBILE: {
    CONTROL_SIZE: 'compact',
    FONT_SIZE_FACTOR: 0.9,
    SHOW_ADVANCED_CONTROLS: false
  },
  DESKTOP: {
    CONTROL_SIZE: 'full',
    FONT_SIZE_FACTOR: 1,
    SHOW_ADVANCED_CONTROLS: true
  }
};

// 환경별 분석 성능 설정
export const ANALYSIS_SETTINGS = {
  MOBILE: {
    FRAME_SKIP: 3,          // 모바일에서는 더 많은 프레임 스킵
    DETECTION_INTERVAL: 150, // 모바일에서는 감지 간격 증가
    PRECISION: 'medium'     // 정밀도 감소
  },
  DESKTOP: {
    FRAME_SKIP: 1,
    DETECTION_INTERVAL: 50,
    PRECISION: 'high'
  }
};

// 현재 디바이스 유형 감지 함수
export const detectDeviceType = (): string => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= BREAKPOINTS.MOBILE) {
      return DEVICE_TYPE.MOBILE;
    } else if (window.innerWidth <= BREAKPOINTS.TABLET) {
      return DEVICE_TYPE.TABLET;
    }
  }
  return DEVICE_TYPE.DESKTOP;
};

// 디바이스 유형에 따른 설정 가져오기
export const getDeviceSpecificSettings = () => {
  const deviceType = detectDeviceType();
  const isMobile = deviceType === DEVICE_TYPE.MOBILE;
  
  return {
    camera: isMobile ? CAMERA_SETTINGS.MOBILE : CAMERA_SETTINGS.DESKTOP,
    ui: isMobile ? UI_SETTINGS.MOBILE : UI_SETTINGS.DESKTOP,
    analysis: isMobile ? ANALYSIS_SETTINGS.MOBILE : ANALYSIS_SETTINGS.DESKTOP
  };
}; 