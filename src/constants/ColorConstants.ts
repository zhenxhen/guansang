/**
 * 애플리케이션에서 사용하는 색상 상수 모음
 */

// 테마 색상
export const THEME_PRIMARY = '#007f8b';
export const THEME_SECONDARY = '#ff6f00';
export const THEME_BACKGROUND = '#ffffff';
export const THEME_TEXT = '#3d3d3d';

// 분석 결과 색상
export const ANALYSIS_GOOD = '#4CAF50'; // 좋은 결과 (녹색)
export const ANALYSIS_MEDIUM = '#FF9800'; // 중간 결과 (주황색)
export const ANALYSIS_POOR = '#F44336'; // 나쁜 결과 (빨간색)

// 그래프 색상
export const GRAPH_LOW = '#5992a6'; // 낮은 값 그래프 색상
export const GRAPH_MEDIUM = '#ff9800'; // 중간 값 그래프 색상
export const GRAPH_HIGH = '#2e7d32'; // 높은 값 그래프 색상

// UI 요소 색상
export const UI_CARD_BACKGROUND = '#f5f5f5';
export const UI_CARD_BORDER = '#e0e0e0';
export const UI_CARD_SHADOW = 'rgba(0, 0, 0, 0.1)';

// 얼굴 특성 요소 색상
export const LEFT_EYE_COLOR = 'rgba(48, 255, 48, 0.6)';  // 왼쪽 눈 관련 요소 색상 (녹색)
export const RIGHT_EYE_COLOR = 'rgba(255, 48, 48, 0.6)'; // 오른쪽 눈 관련 요소 색상 (빨간색)
export const NOSE_INDICATOR_COLOR = 'rgba(255, 255, 255, 0.7)'; // 코 지표 색상
export const ANALYSIS_BOX_BG = 'rgba(0, 0, 0, 0.7)'; // 분석 박스 배경
export const FEATURE_BAR_BG = '#333333'; // 특성 바 배경
export const FEATURE_BAR_FILL = '#75C076'; // 특성 바 채우기 색상

// 투명도 값
export const OVERLAY_OPACITY = 0.7;
export const UI_ELEMENT_OPACITY = 0.9;

/**
 * 색상 관련 상수
 */

// 기본 색상표
export const COLOR = {
  // 프라이머리 컬러
  PRIMARY: {
    LIGHTEST: '#E3F2FD',
    LIGHTER: '#BBDEFB',
    LIGHT: '#90CAF9',
    MAIN: '#2196F3',
    DARK: '#1E88E5',
    DARKER: '#1976D2',
    DARKEST: '#0D47A1'
  },
  
  // 세컨더리 컬러
  SECONDARY: {
    LIGHTEST: '#F3E5F5',
    LIGHTER: '#E1BEE7',
    LIGHT: '#CE93D8',
    MAIN: '#9C27B0',
    DARK: '#8E24AA',
    DARKER: '#7B1FA2',
    DARKEST: '#4A148C'
  },
  
  // 중립 색상 (그레이스케일)
  NEUTRAL: {
    WHITE: '#FFFFFF',
    GRAY_50: '#FAFAFA',
    GRAY_100: '#F5F5F5',
    GRAY_200: '#EEEEEE',
    GRAY_300: '#E0E0E0',
    GRAY_400: '#BDBDBD',
    GRAY_500: '#9E9E9E',
    GRAY_600: '#757575',
    GRAY_700: '#616161',
    GRAY_800: '#424242',
    GRAY_900: '#212121',
    BLACK: '#000000'
  },
  
  // 상태 색상
  STATUS: {
    SUCCESS: {
      LIGHT: '#A5D6A7',
      MAIN: '#4CAF50',
      DARK: '#388E3C'
    },
    WARNING: {
      LIGHT: '#FFE082',
      MAIN: '#FFC107',
      DARK: '#FFA000'
    },
    ERROR: {
      LIGHT: '#EF9A9A',
      MAIN: '#F44336',
      DARK: '#D32F2F'
    },
    INFO: {
      LIGHT: '#81D4FA',
      MAIN: '#03A9F4',
      DARK: '#0288D1'
    }
  },
  
  // 분석 결과 색상
  ANALYSIS: {
    POSITIVE: '#4CAF50',
    NEUTRAL: '#03A9F4',
    NEGATIVE: '#F44336',
    HIGHLIGHT: '#FFC107'
  },
  
  // 차트 색상 팔레트
  CHART: {
    BLUE: '#2196F3',
    RED: '#F44336',
    GREEN: '#4CAF50',
    YELLOW: '#FFEB3B',
    PURPLE: '#9C27B0',
    ORANGE: '#FF9800',
    TEAL: '#009688',
    INDIGO: '#3F51B5',
    PINK: '#E91E63',
    LIME: '#CDDC39'
  },
  
  // 배경 색상
  BACKGROUND: {
    DEFAULT: '#FFFFFF',
    PAPER: '#F5F5F5',
    ELEVATED: '#FFFFFF',
    OVERLAY: 'rgba(0, 0, 0, 0.5)'
  },
  
  // 텍스트 색상
  TEXT: {
    PRIMARY: '#212121',
    SECONDARY: '#757575',
    DISABLED: '#9E9E9E',
    HINT: '#9E9E9E',
    INVERSE: '#FFFFFF'
  },
  
  // 테마 모드별 색상 (Light/Dark 모드)
  THEME: {
    LIGHT: {
      BACKGROUND: '#FFFFFF',
      SURFACE: '#F5F5F5',
      TEXT: '#212121',
      BORDER: '#E0E0E0'
    },
    DARK: {
      BACKGROUND: '#121212',
      SURFACE: '#1E1E1E',
      TEXT: '#FFFFFF',
      BORDER: '#424242'
    }
  }
};

// 그라데이션 색상
export const GRADIENT = {
  PRIMARY: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  SECONDARY: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
  SUCCESS: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
  WARNING: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
  ERROR: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
  COOL: 'linear-gradient(135deg, #03A9F4 0%, #3F51B5 100%)',
  WARM: 'linear-gradient(135deg, #FF9800 0%, #F44336 100%)'
};

// 투명도
export const OPACITY = {
  FULL: 1,
  SEMI: 0.75,
  MEDIUM: 0.5,
  LIGHT: 0.25,
  FAINT: 0.1,
  NONE: 0
}; 