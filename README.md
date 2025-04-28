테스트중
실시간 테스트 중

# 관상 앱 (Guansang App)

얼굴 특징을 분석하고 ㄴㄴ시각화하는 웹 애플리케이션입니다. MediaPipe의 Face Landmark 기술을 활용하여 실시간으로 얼굴의 비율, 대칭성, 눈, 코, 입 등의 특징을 분석합니다.

## 주요 기능

- 실시간 얼굴 인식 및 랜드마크 추적
- 얼굴 대칭성 및 비율 분석
- 눈, 코, 입 등 세부 특징 측정
- 시각적 피드백 및 결과 표시
- 모바일 및 데스크톱 환경 지원

## 기술 스택

- React.js: 프론트엔드 UI 구현
- TypeScript: 타입 안전성과 개발 효율성 강화
- MediaPipe: 얼굴 랜드마크 인식 및 추적
- Canvas API: 시각적 효과 및 그래픽 처리
- 반응형 디자인: 다양한 화면 크기 지원

## 프로젝트 구조

```
src/
├── components/           # 리액트 컴포넌트
│   ├── WebcamDetection.tsx  # 웹캠 인식 및 주요 처리 컴포넌트
│   ├── FaceAnalysisBox.tsx  # 얼굴 분석 결과 표시 컴포넌트
│   └── ...
├── constants/            # 상수 정의
│   ├── UIConstants.ts    # UI 관련 상수
│   ├── ColorConstants.ts # 색상 관련 상수
│   └── ...
├── types/                # 타입 정의
│   ├── FaceFeatures.ts   # 얼굴 특징 관련 인터페이스
│   └── ...
├── utils/                # 유틸리티 함수
│   ├── analysis/         # 분석 관련 유틸리티
│   │   ├── FacialAnalysisUtils.ts
│   │   └── MediaPipeUtils.ts
│   ├── graphics/         # 그래픽 관련 유틸리티
│   │   └── GraphicsUtils.ts
│   ├── ui/               # UI 관련 유틸리티
│   │   └── UIUtils.ts
│   └── ...
└── ...
```

## 시작하기

### 필요 조건

- Node.js 14.x 이상
- npm 또는 yarn

### 설치 및 실행

1. 저장소 복제
   ```bash
   git clone https://github.com/yourusername/guansang-app.git
   cd guansang-app
   ```

2. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn
   ```

3. 개발 서버 실행
   ```bash
   npm start
   # 또는
   yarn start
   ```

4. 브라우저에서 앱 열기
   ```
   http://localhost:3000
   ```

## 빌드

프로덕션용 빌드:

```bash
npm run build
# 또는
yarn build
```

## 작동 방식

1. 웹캠을 통해 얼굴을 인식합니다.
2. MediaPipe의 Face Landmarker가 468개의 얼굴 랜드마크를 추적합니다.
3. 랜드마크 좌표를 기반으로 얼굴 특징을 계산합니다.
4. 계산된 특징을 Canvas에 시각화하고 분석 결과를 표시합니다.
5. 사용자는 실시간으로 얼굴 분석 결과를 확인할 수 있습니다.

## 주의사항

- 카메라 접근 권한이 필요합니다.
- 최신 웹 브라우저(Chrome, Firefox, Safari)에서 사용을 권장합니다.
- 충분한 조명이 있는 환경에서 사용하는 것이 좋습니다.
