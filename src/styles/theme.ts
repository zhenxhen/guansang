import { THEME_PRIMARY, THEME_SECONDARY, THEME_BACKGROUND, THEME_TEXT, 
  ANALYSIS_GOOD, ANALYSIS_MEDIUM, ANALYSIS_POOR, 
  GRAPH_LOW, GRAPH_MEDIUM, GRAPH_HIGH,
  UI_CARD_BACKGROUND, UI_CARD_BORDER, UI_CARD_SHADOW,
  LEFT_EYE_COLOR, RIGHT_EYE_COLOR, NOSE_INDICATOR_COLOR,
  ANALYSIS_BOX_BG, FEATURE_BAR_BG, FEATURE_BAR_FILL,
  OVERLAY_OPACITY, UI_ELEMENT_OPACITY
} from '../constants/ColorConstants';

/**
 * 테마 인터페이스 정의
 */
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    analysis: {
      good: string;
      medium: string;
      poor: string;
    };
    graph: {
      low: string;
      medium: string;
      high: string;
    };
    ui: {
      cardBackground: string;
      cardBorder: string;
      cardShadow: string;
    };
    features: {
      leftEye: string;
      rightEye: string;
      noseIndicator: string;
      analysisBoxBg: string;
      featureBarBg: string;
      featureBarFill: string;
    };
    opacity: {
      overlay: number;
      uiElement: number;
    };
  };
  fonts: {
    family: {
      primary: string;
      secondary: string;
    };
    size: {
      small: string;
      medium: string;
      large: string;
      heading: string;
    };
    weight: {
      regular: number;
      bold: number;
    };
  };
  spacing: {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    circle: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  transitions: {
    short: string;
    medium: string;
    long: string;
  };
}

/**
 * 라이트 테마 기본값
 */
export const lightTheme: Theme = {
  colors: {
    primary: THEME_PRIMARY,
    secondary: THEME_SECONDARY,
    background: THEME_BACKGROUND,
    text: THEME_TEXT,
    analysis: {
      good: ANALYSIS_GOOD,
      medium: ANALYSIS_MEDIUM,
      poor: ANALYSIS_POOR,
    },
    graph: {
      low: GRAPH_LOW,
      medium: GRAPH_MEDIUM,
      high: GRAPH_HIGH,
    },
    ui: {
      cardBackground: UI_CARD_BACKGROUND,
      cardBorder: UI_CARD_BORDER,
      cardShadow: UI_CARD_SHADOW,
    },
    features: {
      leftEye: LEFT_EYE_COLOR,
      rightEye: RIGHT_EYE_COLOR,
      noseIndicator: NOSE_INDICATOR_COLOR,
      analysisBoxBg: ANALYSIS_BOX_BG,
      featureBarBg: FEATURE_BAR_BG,
      featureBarFill: FEATURE_BAR_FILL,
    },
    opacity: {
      overlay: OVERLAY_OPACITY,
      uiElement: UI_ELEMENT_OPACITY,
    },
  },
  fonts: {
    family: {
      primary: 'helvetica, arial, sans-serif',
      secondary: 'georgia, serif',
    },
    size: {
      small: '12px',
      medium: '14px',
      large: '16px',
      heading: '24px',
    },
    weight: {
      regular: 400,
      bold: 700,
    },
  },
  spacing: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    circle: '50%',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    short: '0.1s ease',
    medium: '0.3s ease',
    long: '0.5s ease',
  },
};

/**
 * 다크 테마 기본값
 */
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#00a4b4', // 더 밝은 프라이머리 색상
    secondary: '#ff8f3c', // 더 밝은 세컨더리 색상
    background: '#121212', // 어두운 배경
    text: '#e0e0e0', // 밝은 텍스트
    ui: {
      cardBackground: '#1e1e1e', // 어두운 카드 배경
      cardBorder: '#333333', // 더 어두운 테두리
      cardShadow: 'rgba(0, 0, 0, 0.2)',
    },
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.2)',
    large: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
};

/**
 * 기본 테마 (라이트 테마)
 */
export const defaultTheme = lightTheme; 