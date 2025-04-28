/**
 * 얼굴 및 특성 분석 관련 상수 모음
 */

// 분석 임계값
export const ANALYSIS_THRESHOLDS = {
  // 대칭성 분석 임계값
  SYMMETRY: {
    EXCELLENT: 0.95, // 매우 좋음 (95% 이상 대칭)
    GOOD: 0.85,      // 좋음 (85% 이상 대칭)
    MODERATE: 0.75,  // 보통 (75% 이상 대칭)
    POOR: 0.60       // 낮음 (60% 이상 대칭)
  },
  
  // 눈 비율 임계값
  EYE_RATIO: {
    IDEAL: 0.45,    // 이상적인 눈 비율
    GOOD: 0.40,     // 좋은 눈 비율
    ACCEPTABLE: 0.35 // 허용 가능한 눈 비율
  },
  
  // 얼굴 비율 임계값
  FACE_RATIO: {
    GOLDEN_RATIO: 1.618, // 황금 비율
    TOLERANCE: 0.15      // 허용 오차
  }
};

// 분석 가중치
export const ANALYSIS_WEIGHTS = {
  SYMMETRY: 0.4,        // 전체 점수에서 대칭성 가중치
  PROPORTIONS: 0.35,    // 전체 점수에서 비율 가중치
  FEATURE_SIZE: 0.25    // 전체 점수에서 특성 크기 가중치
};

// 분석 속도 및 성능 조정
export const ANALYSIS_PERFORMANCE = {
  FRAME_SKIP: 2,              // 몇 프레임마다 분석할지 설정 (높을수록 성능 향상)
  DETECTION_INTERVAL: 100,    // 감지 사이의 간격 (ms)
  RESULT_SMOOTHING: 0.3       // 결과 스무딩 계수 (0-1, 높을수록 더 부드러움)
};

// 특성 측정 기준점
export const FEATURE_REFERENCE = {
  EYE_WIDTH_TO_FACE_WIDTH: 0.45,  // 눈 너비/얼굴 너비 이상적 비율
  NOSE_TO_FACE_HEIGHT: 0.33,      // 코 위치/얼굴 높이 이상적 비율
  LIP_TO_FACE_HEIGHT: 0.6         // 입술 위치/얼굴 높이 이상적 비율
};

/**
 * 분석 관련 상수
 */

// 분석 모드
export const ANALYSIS_MODE = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  PROFESSIONAL: 'professional'
};

// 세부 분석 유형
export const ANALYSIS_TYPE = {
  FACIAL: 'facial',
  POSTURE: 'posture',
  SPEECH: 'speech',
  BEHAVIOR: 'behavior',
  COMPREHENSIVE: 'comprehensive'
};

// 분석 정확도 레벨
export const ACCURACY_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'veryHigh'
};

// 얼굴 분석 옵션
export const FACIAL_ANALYSIS_OPTIONS = {
  // 분석 항목
  FEATURES: {
    EMOTION: 'emotion',
    AGE: 'age',
    GENDER: 'gender',
    EXPRESSION: 'expression',
    LANDMARKS: 'landmarks'
  },
  
  // 감정 카테고리
  EMOTIONS: {
    HAPPY: 'happy',
    SAD: 'sad',
    ANGRY: 'angry',
    FEARFUL: 'fearful',
    DISGUSTED: 'disgusted',
    SURPRISED: 'surprised',
    NEUTRAL: 'neutral',
    CONTEMPT: 'contempt'
  },
  
  // 추적 설정
  TRACKING: {
    FREQUENCY: 30, // 초당 프레임 수
    SENSITIVITY: 0.75,
    DETECTION_INTERVAL: 100, // 밀리초 단위
    CONFIDENCE_THRESHOLD: 0.85
  }
};

// 자세 분석 옵션
export const POSTURE_ANALYSIS_OPTIONS = {
  // 분석 항목
  FEATURES: {
    POSE: 'pose',
    GESTURE: 'gesture',
    MOVEMENT: 'movement',
    KEYPOINTS: 'keypoints'
  },
  
  // 자세 카테고리
  POSES: {
    STANDING: 'standing',
    SITTING: 'sitting',
    WALKING: 'walking',
    BENDING: 'bending'
  },
  
  // 제스처 카테고리
  GESTURES: {
    HAND_WAVE: 'handWave',
    POINTING: 'pointing',
    CROSSED_ARMS: 'crossedArms',
    HANDS_ON_HIPS: 'handsOnHips',
    NODDING: 'nodding'
  },
  
  // 추적 설정
  TRACKING: {
    FREQUENCY: 15, // 초당 프레임 수
    SENSITIVITY: 0.6,
    DETECTION_INTERVAL: 200, // 밀리초 단위
    CONFIDENCE_THRESHOLD: 0.7
  }
};

// 음성 분석 옵션
export const SPEECH_ANALYSIS_OPTIONS = {
  // 분석 항목
  FEATURES: {
    TONE: 'tone',
    PACE: 'pace',
    VOLUME: 'volume',
    CLARITY: 'clarity',
    CONTENT: 'content'
  },
  
  // 톤 카테고리
  TONES: {
    CONFIDENT: 'confident',
    HESITANT: 'hesitant',
    ENTHUSIASTIC: 'enthusiastic',
    MONOTONE: 'monotone',
    FRUSTRATED: 'frustrated'
  },
  
  // 속도 범위
  PACE: {
    SLOW: 'slow', // < 110 WPM
    MEDIUM: 'medium', // 110-150 WPM
    FAST: 'fast' // > 150 WPM
  },
  
  // 볼륨 범위
  VOLUME: {
    QUIET: 'quiet', // < -18dB
    NORMAL: 'normal', // -18dB to -10dB
    LOUD: 'loud' // > -10dB
  },
  
  // 녹음 설정
  RECORDING: {
    SAMPLE_RATE: 44100, // 샘플링 레이트 (Hz)
    BIT_DEPTH: 16,
    CHANNELS: 1, // 모노
    FORMAT: 'wav',
    MAX_DURATION: 300 // 최대 녹음 시간 (초)
  }
};

// 행동 분석 옵션
export const BEHAVIOR_ANALYSIS_OPTIONS = {
  // 분석 항목
  FEATURES: {
    ATTENTION: 'attention',
    ENGAGEMENT: 'engagement',
    INTERACTION: 'interaction',
    PATTERNS: 'patterns'
  },
  
  // 집중도 수준
  ATTENTION_LEVELS: {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high'
  },
  
  // 참여도 수준
  ENGAGEMENT_LEVELS: {
    PASSIVE: 'passive',
    REACTIVE: 'reactive',
    PROACTIVE: 'proactive'
  },
  
  // 상호작용 유형
  INTERACTION_TYPES: {
    DIRECT: 'direct',
    INDIRECT: 'indirect',
    GROUP: 'group',
    NONE: 'none'
  }
};

// 결과 표시 옵션
export const RESULT_DISPLAY_OPTIONS = {
  // 차트 유형
  CHART_TYPES: {
    BAR: 'bar',
    LINE: 'line',
    PIE: 'pie',
    RADAR: 'radar',
    SCATTER: 'scatter',
    HEATMAP: 'heatmap'
  },
  
  // 데이터 시각화 스타일
  VISUALIZATION_STYLES: {
    SIMPLE: 'simple',
    DETAILED: 'detailed',
    COMPARATIVE: 'comparative',
    TIMELINE: 'timeline'
  },
  
  // 보고서 형식
  REPORT_FORMATS: {
    SUMMARY: 'summary',
    DETAILED: 'detailed',
    TECHNICAL: 'technical',
    VISUAL: 'visual'
  }
};

// 분석 성능 설정
export const PERFORMANCE_SETTINGS = {
  // 디바이스 성능 레벨
  DEVICE_PERFORMANCE: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },
  
  // 처리 모드
  PROCESSING_MODE: {
    REAL_TIME: 'realTime',
    BATCH: 'batch',
    CLOUD: 'cloud',
    HYBRID: 'hybrid'
  },
  
  // 분석 품질 레벨
  QUALITY_LEVEL: {
    DRAFT: 'draft', // 저품질, 고속
    STANDARD: 'standard', // 균형잡힌 설정
    PREMIUM: 'premium' // 고품질, 저속
  }
};

// 환경별 분석 설정 (모바일/데스크톱)
export const DEVICE_SPECIFIC_SETTINGS = {
  MOBILE: {
    MAX_RESOLUTION: '720p',
    FRAME_RATE: 15,
    ANALYSIS_INTERVAL: 500, // ms
    FEATURES_ENABLED: {
      FACIAL: true,
      POSTURE: true,
      SPEECH: true,
      BEHAVIOR: false // 모바일에서는 행동 분석 비활성화
    },
    PERFORMANCE_PRESET: PERFORMANCE_SETTINGS.QUALITY_LEVEL.STANDARD
  },
  DESKTOP: {
    MAX_RESOLUTION: '1080p',
    FRAME_RATE: 30,
    ANALYSIS_INTERVAL: 100, // ms
    FEATURES_ENABLED: {
      FACIAL: true,
      POSTURE: true,
      SPEECH: true,
      BEHAVIOR: true
    },
    PERFORMANCE_PRESET: PERFORMANCE_SETTINGS.QUALITY_LEVEL.PREMIUM
  }
}; 