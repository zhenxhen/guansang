/**
 * UI 요소 관련 상수 모음
 */

// 그래프 관련 상수
export const MIN_GRAPH_WIDTH = 220; // 그래프 표시에 필요한 최소 박스 너비 (픽셀)
export const MIN_PIXEL_BAR_WIDTH = 10; // 바 너비 최소 픽셀 크기

// 반응형 디자인 중단점
export const BREAKPOINT_MOBILE = 768; // 모바일 중단점
export const BREAKPOINT_TABLET = 1024; // 태블릿 중단점

// 분석 박스 레이아웃 상수
export const FEATURE_START_Y = 0.15; // 시작 위치 (전체 높이 대비 비율)
export const FEATURE_INTERVAL = 0.12; // 각 항목 간 간격 (전체 높이 대비 비율)

// 애니메이션 및 트랜지션 설정
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ACCELERATE: 'cubic-bezier(0.4, 0, 1, 1)',
    DECELERATE: 'cubic-bezier(0, 0, 0.2, 1)'
  },
  FADE: {
    IN: 'opacity 0.3s ease-in',
    OUT: 'opacity 0.2s ease-out'
  },
  SCALE: {
    IN: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    OUT: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// 여백 및 간격
export const SPACING = {
  UNIT: 4,
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  SECTION: 64
};

// 반경 설정
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 16,
  CIRCLE: '50%',
  PILL: 999
};

// 그림자 설정
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  MD: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  LG: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
  XL: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)'
};

// 폰트 크기
export const FONT_SIZE = {
  XS: '0.75rem',    // 12px
  SM: '0.875rem',   // 14px
  MD: '1rem',       // 16px
  LG: '1.125rem',   // 18px
  XL: '1.25rem',    // 20px
  XXL: '1.5rem',    // 24px
  DISPLAY1: '2rem', // 32px
  DISPLAY2: '2.5rem' // 40px
};

// 폰트 두께
export const FONT_WEIGHT = {
  LIGHT: 300,
  REGULAR: 400,
  MEDIUM: 500,
  BOLD: 700
};

// Z-인덱스 레이어
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 0,
  CONTENT: 10,
  OVERLAY: 100,
  DROPDOWN: 200,
  MODAL: 300,
  POPOVER: 400,
  TOOLTIP: 500,
  TOAST: 600
};

// 그리드 및 레이아웃 설정
export const LAYOUT = {
  CONTAINER_MAX_WIDTH: '1200px',
  CONTAINER_PADDING: '16px',
  COLUMN_GAP: '16px',
  ROW_GAP: '24px',
  GRID_COLUMNS: 12,
  BREAKPOINTS: {
    MOBILE_S: '320px',
    MOBILE_M: '375px',
    MOBILE_L: '425px',
    TABLET: '768px',
    LAPTOP: '1024px',
    LAPTOP_L: '1440px',
    DESKTOP: '1920px',
    DESKTOP_L: '2560px'
  },
  CONTAINER: {
    SMALL: '640px',
    MEDIUM: '768px',
    LARGE: '1024px',
    EXTRA_LARGE: '1280px',
    FULL_WIDTH: '100%'
  },
  SPACING: {
    NONE: '0px',
    EXTRA_SMALL: '4px',
    SMALL: '8px',
    MEDIUM: '16px',
    LARGE: '24px',
    EXTRA_LARGE: '32px',
    DOUBLE_LARGE: '48px',
    TRIPLE_LARGE: '64px'
  },
  GRID: {
    COLUMNS: {
      MOBILE: 4,
      TABLET: 8,
      DESKTOP: 12
    },
    GAP: {
      SMALL: '16px',
      MEDIUM: '24px',
      LARGE: '32px'
    }
  }
};

// 미디어 쿼리 브레이크포인트 - LAYOUT에 정의된 값을 사용
export const MEDIA_QUERY = {
  MOBILE: `@media (max-width: ${LAYOUT.BREAKPOINTS.TABLET})`,
  TABLET: `@media (min-width: ${LAYOUT.BREAKPOINTS.TABLET}) and (max-width: ${LAYOUT.BREAKPOINTS.LAPTOP})`,
  DESKTOP: `@media (min-width: ${LAYOUT.BREAKPOINTS.LAPTOP})`,
  DARK_MODE: '@media (prefers-color-scheme: dark)',
  LIGHT_MODE: '@media (prefers-color-scheme: light)',
  REDUCED_MOTION: '@media (prefers-reduced-motion: reduce)'
};

// 스무딩 계수
export const SMOOTHING_FACTOR_DESKTOP = 0.5; // 데스크톱 스무딩 계수
export const SMOOTHING_FACTOR_MOBILE = 0.3; // 모바일 스무딩 계수

// 모바일 UI 비율
export const MOBILE_RESULT_HEIGHT_RATIO = 0.4; // 모바일에서 결과 패널 최대 높이 비율

// 얼굴 랜드마크 인덱스
export const LANDMARK_INDICES = {
  NOSE_TIP: 1,
  BETWEEN_EYES: 168,
  LEFT_EYE_INNER: 362,
  LEFT_EYE_OUTER: 263,
  RIGHT_EYE_INNER: 133,
  RIGHT_EYE_OUTER: 33,
  LEFT_FACE_EDGE: 93,
  RIGHT_FACE_EDGE: 323,
  FOREHEAD: 10,
  CHIN: 152,
  NOSE_TOP: 6,
  LEFT_NOSTRIL: 115,
  RIGHT_NOSTRIL: 344,
  LEFT_EYE_TOP: 386,
  LEFT_EYE_BOTTOM: 374,
  RIGHT_EYE_TOP: 159,
  RIGHT_EYE_BOTTOM: 145
};

// 원 그리기 상수
export const CIRCLE_RADIUS = {
  LARGE: 20, // 큰 원 반지름
  SMALL: 15  // 작은 원 반지름
};

// 특성 분석 상수
export const FEATURE_THRESHOLDS = {
  HIGH_VALUE: 0.5,   // 높은 값 임계치
  MEDIUM_VALUE: 0.2, // 중간 값 임계치
  SYMMETRY_GOOD: 0.95 // 좋은 대칭성 임계치
};

// 카메라 관련 상수
export const VIDEO_SIZE = {
  WIDTH: 640,  // 카메라 가로 크기
  HEIGHT: 480  // 카메라 세로 크기
};

// 얼굴 비율 가중치
export const FACE_RATIO_WEIGHTS = {
  EYE_WIDTH_SYMMETRY: 0.4, // 눈 너비 대칭 가중치
  NOSTRIL_SYMMETRY: 0.3,   // 콧망울 대칭 가중치
  ANGLE_SYMMETRY: 0.3      // 각도 대칭 가중치
};

// 타이포그래피
export const TYPOGRAPHY = {
  // 폰트 패밀리
  FONT_FAMILY: {
    PRIMARY: "'Noto Sans KR', sans-serif",
    SECONDARY: "'Roboto', sans-serif",
    MONOSPACE: "'Roboto Mono', monospace"
  },
  
  // 폰트 사이즈
  FONT_SIZE: {
    TINY: '10px',
    EXTRA_SMALL: '12px',
    SMALL: '14px',
    MEDIUM: '16px',
    LARGE: '18px',
    EXTRA_LARGE: '20px',
    HEADING_6: '18px',
    HEADING_5: '20px',
    HEADING_4: '24px',
    HEADING_3: '30px',
    HEADING_2: '36px',
    HEADING_1: '48px'
  },
  
  // 폰트 두께
  FONT_WEIGHT: {
    THIN: 100,
    EXTRA_LIGHT: 200,
    LIGHT: 300,
    REGULAR: 400,
    MEDIUM: 500,
    SEMI_BOLD: 600,
    BOLD: 700,
    EXTRA_BOLD: 800,
    BLACK: 900
  },
  
  // 행간
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.5,
    LOOSE: 1.8
  },
  
  // 자간
  LETTER_SPACING: {
    TIGHT: '-0.05em',
    NORMAL: '0',
    LOOSE: '0.05em',
    WIDE: '0.1em'
  }
};

// 효과 (그림자, 애니메이션 등)
export const EFFECTS = {
  // 박스 그림자
  BOX_SHADOW: {
    NONE: 'none',
    SOFT: '0 2px 8px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 4px 12px rgba(0, 0, 0, 0.15)',
    HARD: '0 8px 24px rgba(0, 0, 0, 0.2)',
    INSET: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  
  // 테두리 반경
  BORDER_RADIUS: {
    NONE: '0',
    SMALL: '4px',
    MEDIUM: '8px',
    LARGE: '12px',
    EXTRA_LARGE: '16px',
    ROUND: '50%',
    PILL: '9999px'
  },
  
  // 애니메이션 지속 시간
  ANIMATION_DURATION: {
    INSTANT: '0s',
    FAST: '0.15s',
    NORMAL: '0.3s',
    SLOW: '0.5s',
    VERY_SLOW: '1s'
  },
  
  // 애니메이션 타이밍 함수
  ANIMATION_TIMING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  },
  
  // 불투명도
  OPACITY: {
    NONE: 0,
    EXTRA_LOW: 0.1,
    LOW: 0.25,
    MEDIUM: 0.5,
    HIGH: 0.75,
    EXTRA_HIGH: 0.9,
    FULL: 1
  }
};

// UI 컴포넌트 사이즈
export const COMPONENT_SIZE = {
  // 버튼 크기
  BUTTON: {
    TINY: {
      HEIGHT: '24px',
      PADDING: '0 8px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.EXTRA_SMALL
    },
    SMALL: {
      HEIGHT: '32px',
      PADDING: '0 12px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.SMALL
    },
    MEDIUM: {
      HEIGHT: '40px',
      PADDING: '0 16px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.MEDIUM
    },
    LARGE: {
      HEIGHT: '48px',
      PADDING: '0 20px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.LARGE
    },
    EXTRA_LARGE: {
      HEIGHT: '56px',
      PADDING: '0 24px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.EXTRA_LARGE
    }
  },
  
  // 입력 필드 크기
  INPUT: {
    SMALL: {
      HEIGHT: '32px',
      PADDING: '0 12px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.SMALL
    },
    MEDIUM: {
      HEIGHT: '40px',
      PADDING: '0 16px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.MEDIUM
    },
    LARGE: {
      HEIGHT: '48px',
      PADDING: '0 20px',
      FONT_SIZE: TYPOGRAPHY.FONT_SIZE.LARGE
    }
  },
  
  // 아이콘 크기
  ICON: {
    TINY: '12px',
    SMALL: '16px',
    MEDIUM: '24px',
    LARGE: '32px',
    EXTRA_LARGE: '48px'
  }
};

// 이미지 및 미디어 비율
export const ASPECT_RATIO = {
  SQUARE: '1:1',
  PORTRAIT: '3:4',
  LANDSCAPE: '16:9',
  WIDE: '21:9',
  ULTRA_WIDE: '32:9',
  GOLDEN_RATIO: '1.618:1'
};

// 폼 요소 상태
export const FORM_STATE = {
  NORMAL: 'normal',
  FOCUS: 'focus',
  HOVER: 'hover',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning'
};

// 장치별 UI 설정
export const DEVICE_UI_SETTINGS = {
  // 모바일 설정
  MOBILE: {
    FONT_SIZE_ADJUSTMENT: '0.9', // 더 작은 폰트 사이즈
    BUTTON_SIZE: COMPONENT_SIZE.BUTTON.MEDIUM,
    INPUT_SIZE: COMPONENT_SIZE.INPUT.MEDIUM,
    SPACING_MULTIPLIER: 0.8, // 더 작은 여백
    TOUCH_TARGET_MIN_SIZE: '44px' // 터치 영역 최소 크기
  },
  
  // 태블릿 설정
  TABLET: {
    FONT_SIZE_ADJUSTMENT: '1',
    BUTTON_SIZE: COMPONENT_SIZE.BUTTON.MEDIUM,
    INPUT_SIZE: COMPONENT_SIZE.INPUT.MEDIUM,
    SPACING_MULTIPLIER: 1,
    TOUCH_TARGET_MIN_SIZE: '40px'
  },
  
  // 데스크톱 설정
  DESKTOP: {
    FONT_SIZE_ADJUSTMENT: '1',
    BUTTON_SIZE: COMPONENT_SIZE.BUTTON.MEDIUM,
    INPUT_SIZE: COMPONENT_SIZE.INPUT.MEDIUM,
    SPACING_MULTIPLIER: 1,
    CURSOR_POINTER_AREA: '16px' // 커서 영역 크기
  }
}; 