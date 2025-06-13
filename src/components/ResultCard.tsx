/// <reference types="@types/showdown" />

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import html2canvas from 'html2canvas';
import { getAIResult } from '../utils/AI_result';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import showdown from 'showdown';
import { getRandomTraitImage, isValidTrait } from '../utils/image_card';

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
  * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #fff;
    perspective: 1000px;
  }
`;

// 애니메이션 키프레임 정의
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 50px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 50px, 0);
  }
`;

// CSS 애니메이션 완료 상태를 적용하는 전역 스타일
const CaptureStyles = createGlobalStyle<{ forCapture: boolean }>`
  ${props => props.forCapture && `
    body {
      background-color: #000;
    }
  `}
`;

// CSS 스타일 개선
const MarkdownStyles = createGlobalStyle`
  .percent-graph {
    margin: 0px 0;
    width: 100%;
  }

  .graph-layout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  
  .graph-left-item,
  .graph-right-item {
    flex: 0 0 15%; /* 고정 너비로 변경 */
    font-size: 16px;
    font-weight: bold;
    color: #797979;
    text-align: center;
    padding: 0 0px;
  }
  
  .graph-middle {
    flex: 0 0 65%; /* 중앙 그래프의 너비 설정 */
  }
  
  .graph-container {
    width: 100%;
    height: 17px;
    padding: 0px;
    // background-color: #f0f0f0;
    border-radius: 20px;
    margin: 0px 0;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .graph-bar {
    height: 100%;
    // background: linear-gradient(to right, #888, #555);
    border-radius: 20px;
    transition: width 0.8s ease-in-out;
    position: relative;
  }

  .graph-bar::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 50px;
    background-color: #d5d5d5;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, .6);
    border-radius: 1px;
    z-index: 3000;
  }

  .graph-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: transparent;
    font-size: 12px;
    font-weight: 700;
    // text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.37);
  }

  /* 마크다운 컨텐츠 스타일 유지 */
  .markdown-content {
    line-height: 1.8;
    font-size: 14px;
    color: transparent;
    text-align: left;
  }
  
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    font-weight: 700;
    margin: 15px 0 15px;
    line-height: 1.8;
  }
  
  .markdown-content h1 {
    font-size: 14px;
    color: #797979;

    
  }
  
  .markdown-content h2 {
    font-size: 14px;
    margin: 40px 0 40px;
    text-align: left;
  }
  
  .markdown-content h3 {
    font-size: 14px;
    color: #797979;
  }
  
  .markdown-content p {
    font-size: 14px;
    margin: 0 0 40px;
    color: #797979;
    text-align: left;
  }
  
  .markdown-content strong {
    font-size: 16px;
    font-weight: 700;
    color: #555;
  }
`;

// 화면 크기에 따른 스타일을 정의하는 미디어 쿼리
const responsiveStyles = {
  extraSmall: {
    labelSize: '9px',
    valueSize: '10px',
    circleSize: '16px',
    maxWidth: '70px',
  },
  small: {
    labelSize: '10px',
    valueSize: '12px',
    circleSize: '20px',
    maxWidth: '90px',
  },
  medium: {
    labelSize: '12px',
    valueSize: '14px',
    circleSize: '24px',
    maxWidth: '110px',
  },
  large: {
    labelSize: '14px', 
    valueSize: '16px',
    circleSize: '30px',
    maxWidth: '130px',
  }
};

// FaceFeatures 인터페이스 직접 정의 
interface FaceFeatures {
  faceRatio: number;
  symmetryScore: number;
  foreheadNoseChinRatio: number;
  eyeWidth_L: number;
  eyeWidth_R: number;
  eyeSeparation: number;
  eyeAngle_L: number;
  eyeAngle_R: number;
  eyeAngleDeg_L: number;
  eyeAngleDeg_R: number;
  noseLength: number;
  noseHeight: number;
  nostrilSize_L: number;
  nostrilSize_R: number;
  mouthWidth: number;
  mouthHeight: number;
  mouthCurve: number;
  lipThickness: number;
  lowerLipThickness: number;
  skinTone: number;
  wrinkleScore: number;
  faceRegionAnalysis: number;
  eyeDistance: number;
  eyeDistanceRatio: number;
  eyeIrisColor_L: string;
  eyeIrisColor_R: string;
  eyeDarkCircleColor: string;
  skinToneColor: string;
  faceWidthPixels?: number;
  displayFaceRatio?: number; // 실시간 UI에서 표시되는 변환된 얼굴 비율
  displaySymmetryScore?: number; // 실시간 UI에서 표시되는 변환된 대칭성 점수
  displayNoseLength?: number;
  displayNoseHeight?: number;
  displayLowerLipThickness?: number;
  [key: string]: number | string | undefined;
}

// 그라데이션을 위한 8가지 색상 정의
const gradientColors = [
  { name: 'deepBlue', value: '30, 50, 80' },
  { name: 'purple', value: '70, 30, 90' },
  { name: 'teal', value: '20, 80, 80' },
  { name: 'burgundy', value: '80, 20, 40' },
  { name: 'forestGreen', value: '30, 70, 30' },
  { name: 'darkNavy', value: '20, 30, 60' },
  { name: 'maroon', value: '90, 20, 30' },
  { name: 'slate', value: '50, 60, 70' }
];

interface ResultCardProps {
  result: FaceFeatures | null;
  onRetake: () => void;
  onSave: () => void;
  userName?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  max-height: calc(90vh);
  background: #fff;
  margin: 0px;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
`;

// 카드 흔들림 애니메이션 키프레임 추가
const wiggleAnimation = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(20deg); }
  100% { transform: rotateY(0deg); }
`;

// 흔들림 효과가 적용된 스타일
const WiggleEffectStyle = createGlobalStyle<{ shouldWiggle: boolean }>`
  .card-wrapper.wiggling {
    animation: ${wiggleAnimation} 2s ease-in-out forwards;
    animation-iteration-count: 1;
  }
`;

const CardWrapper = styled.div<{ isFlipped: boolean; isVisible: boolean; isLoading?: boolean }>`
  width: 90%;
  max-width: 400px;
  aspect-ratio: 0.46;
  margin: 20px 20px 60px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 1s ease;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped 
    ? 'rotateY(180deg)' 
    : props.isVisible 
      ? 'rotateY(0)' 
      : 'rotateY(0)'};
  opacity: ${props => props.isVisible ? 1 : 0};
  cursor: ${props => (props.isVisible && !props.isLoading) ? 'pointer' : 'default'};
  perspective: 100px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    pointer-events: none;
    opacity: ${props => props.isFlipped ? 0 : 1};
    transition: opacity 0.4s ease;
  }
`;

const GradientOverlay = styled.div<{ color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: ${props => `linear-gradient(to top, rgba(${props.color}, 0.3) 0%, rgba(${props.color}, 0.1) 60%, rgba(${props.color}, 0) 100%)`};
  z-index: 15;
  pointer-events: none;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const CardFront = styled.div<{ isFlipped: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  // backface-visibility: hidden;
  // -webkit-backface-visibility: hidden;
  transition: opacity 0.3s ease-in-out ${props => props.isFlipped ? 
  '0s' : '0.3s'};
  opacity: ${props => props.isFlipped ? 0 : 1};
  transform: translateZ(0);
  class-name: card-front;
  background-color: transparent;
  border-radius: 20px;
`;

const CardBack = styled.div<{ isFlipped: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  // backface-visibility: hidden;
  // -webkit-backface-visibility: hidden;
  transform: rotateY(180deg) translateZ(0);
  background-color: transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  transition: all 0.3s ease-in-out;
  transition-delay: .1s;
  opacity: ${props => props.isFlipped ? 1 : 0};
  class-name: card-back;
  z-index: 20;
  transform-style: preserve-3d;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const CardBackContent = styled.div`
  text-align: center;
  max-width: 100%;
  width: 100%;
  z-index: 25;
  transform: scaleX(-1);
  margin-top: 0;
  opacity: 0;
    transition: all 0.3s ease-in-out;
  // transition-delay: 0.3s;
`;

const HighestTraitTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #555;
  margin-bottom: 30px;
  transform: scaleX(-1);
  text-align: center;
`;

const TraitImage = styled.img`
  width: 100%;
  height: 450px;
  object-fit: cover;
  margin: 0 auto 30px;
  transform: scaleX(-1);
  display: block;
  border-radius: 10px;
  border: 0.5px solid #fff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, .1);
`;

const TraitTitle = styled.div`
  position: absolute;
  bottom: 10%;
  left: 0;
  right: 0;
  text-align: center;
  color: #636363;
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 1);
  font-size: 18px;
  font-weight: 800;
  z-index: 25;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  transform: scaleX(-1);
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 30px;
  padding: 0;
  background: transparent;
`;

const CardBackTitle = styled.h2`
  // font-size: 20px;
  margin-bottom: 20px;
  font-weight: 700;
  color: #797979;
  transform: scaleX(-1);
`;

const CardBackDescription = styled.div`
  line-height: 1.8;
  margin-bottom: 20px;
  transform: scaleX(-1);
  padding: 0 15px;
  
  /* 마크다운 스타일 */
  & .markdown-content {
    line-height: 1.8;
  }
  
  & .markdown-content h1, 
  & .markdown-content h2, 
  & .markdown-content h3 {
    font-weight: 700;
    margin: 15px 0 15px;
    line-height: 1.8;
  }
  
  & .markdown-content h1 {
    font-size: 14px;
    color: #797979;
    text-align: center;
  }
  
  & .markdown-content h2 {
    font-size: 14px;
    margin: 40px 0 40px;
    text-align: center;
  }
  
  & .markdown-content h3 {
    font-size: 14px;
    color: #797979;
  }
  
  & .markdown-content p {
    font-size: 14px;
    margin: 0 0 40px;
    color: #797979;
    text-align: left;
  }
  
  & .markdown-content strong {
    font-size: 16px;
    font-weight: 700;
    color: #555;
  }
  
  & .markdown-content em {
    font-style: normal;
    font-size: 16px;
    color: #797979;
    font-weight: 700;
  }
  
  & .markdown-content ul, 
  & .markdown-content ol {
    padding-left: 20px;
    margin: 10px 0;
  }
  
  & .markdown-content li {
    margin-bottom: 5px;
  }
  
  & .markdown-content blockquote {
    padding-left: 10px;
    border-left: 3px solid #aaa;
    color: #888;
    margin: 10px 0;
  }
  
  & .markdown-content code {
    background-color: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 13px;
  }
  
  & .markdown-content hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 15px 0;
  }
`;

const FullScreenCard = styled.div`
  flex: 1;
  position: relative;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  box-sizing: border-box;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-color: #1a1a1a; /* 어두운 회색으로 변경 - 배경 이미지와 자연스럽게 어울리는 색상 */
`;

const FaceContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FaceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 1;
    transform: scaleX(-1);
`;

const LoadingVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
  transform: scaleX(-1); /* 영상 좌우반전 */
`;

// 각 항목들의 배치를 위한 스타일 컴포넌트
const DataItem = styled.div<{ 
  top?: string, 
  left?: string, 
  right?: string, 
  bottom?: string, 
  textAlign?: string,
  screenSize: 'extraSmall' | 'small' | 'medium' | 'large'
}>`
  position: absolute;
  top: ${props => props.top || 'auto'};
  left: ${props => props.left || 'auto'};
  right: ${props => props.right || 'auto'};
  bottom: ${props => props.bottom || 'auto'};
  display: flex;
  flex-direction: column;
  align-items: ${props => props.textAlign === 'left' ? 'flex-start' : props.textAlign === 'right' ? 'flex-end' : 'center'};
  z-index: 15;
  max-width: ${props => responsiveStyles[props.screenSize].maxWidth};
  transition: font-size 0.2s ease;
`;

const DataLabel = styled.span<{ screenSize: 'extraSmall' | 'small' | 'medium' | 'large' }>`
  font-size: ${props => responsiveStyles[props.screenSize].labelSize};
  color: #9F9F9F;
  margin-bottom: 2px;
  font-weight: 500;
  white-space: nowrap;
`;

// 숫자 애니메이션을 위한 커스텀 훅
const useNumberAnimation = (endValue: number, shouldStart: boolean, duration: number = 1500, delay: number = 0) => {
  const [value, setValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 이전 애니메이션 정리
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (shouldStart && endValue !== undefined && endValue !== null && !isNaN(endValue)) {
      setValue(0); // 시작값을 0으로 리셋
      
      timeoutRef.current = setTimeout(() => {
        const startTime = Date.now();
        
        const animate = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // easeOutCubic 이징 함수 적용
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = easedProgress * endValue;

          setValue(currentValue);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [endValue, shouldStart, duration, delay]);

  return value;
};

const DataValue = styled.span<{ screenSize: 'extraSmall' | 'small' | 'medium' | 'large' }>`
  font-size: ${props => responsiveStyles[props.screenSize].valueSize};
  color: #797979;
  font-weight: 700;
  transition: color 0.3s ease;
`;

// 애니메이션이 적용된 숫자 컴포넌트
const AnimatedNumber: React.FC<{ 
  value: number; 
  format?: (value: number) => string; 
  delay?: number;
  shouldStart: boolean;
}> = ({ 
  value, 
  format = (v) => v.toFixed(2),
  delay = 0,
  shouldStart
}) => {
  const animatedValue = useNumberAnimation(value, shouldStart, 1500, delay);
  return <>{format(animatedValue)}</>;
};

const ColorCircle = styled.div<{ color: string, screenSize: 'extraSmall' | 'small' | 'medium' | 'large' }>`
  width: ${props => responsiveStyles[props.screenSize].circleSize};
  height: ${props => responsiveStyles[props.screenSize].circleSize};
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-top: 2px;
`;

// const ButtonsContainer = styled.div<{ isVisible: boolean }>`
//   display: flex;
//   gap: 16px;
//   width: 100%;
//   justify-content: center;
//   z-index: 20;
//   opacity: ${props => props.isVisible ? 1 : 0};
//   transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
//   transition: opacity 0.6s ease, transform 0.6s ease;
//   position: fixed;
//   // bottom: 60px;
//   left: 0;
//   right: 0;
//   padding-bottom: env(safe-area-inset-bottom); // iOS Safari 하단 영역 고려
// `;

const Button = styled.button<{ isRotated?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  background-color: rgba(210, 210, 210, 0.7);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 40px;
  height: 40px;
  font-family: 'Pretendard', sans-serif;

  &:hover {
    background-color: #555555;
  }

  & img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    transition: transform 0.6s ease;
    transform: ${props => props.isRotated ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const InterpretText = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 280px;
  text-align: center;
  color:rgba(121, 121, 121, 0.58);
  font-size: 16px;
  font-weight: 800;
  z-index: 25;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
`;

const Footer = styled.div<{ isVisible?: boolean }>`
  margin-top: 10px;
  text-align: center;
  width: 100%;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  z-index: 20;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  padding-bottom: env(safe-area-inset-bottom);
`;

const Copyright = styled.div`
  color: #999;
  font-size: 9px;
  font-family: 'Pretendard', sans-serif;
  background: transparent;
`;

const CardLogo = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 20;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.6s ease, transform 0.6s ease;
`;

const MarkdownTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  font-size: 12px;
`;

const MarkdownTableHeader = styled.th`
  background-color: rgba(0, 0, 0, 0.05);
  color: #666;
  font-weight: 700;
  padding: 8px 5px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const MarkdownTableCell = styled.td`
  padding: 8px 5px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const MarkdownTableRow = styled.tr`
  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

// 퍼센트 막대 그래프 스타일 개선
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 22px;
  background-color: #f0f0f0;
  border-radius: 11px;
  margin: 8px 0 25px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => `${props.percent}%`};
  background: linear-gradient(to right, #888, #555);
  border-radius: 11px;
  transition: width 0.8s ease-in-out;
`;

const PercentLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #555;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0px 0px 3px rgba(255, 255, 255, 0.9);
`;

// 퍼센트 그래프 컴포넌트 제목 스타일
const GraphTitle = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
  color: #797979;
  transform: scaleX(-1); // CardBackContent와 동일하게 변환 적용
`;

// Showdown 컨버터 설정
const converter = new showdown.Converter({
  tables: true,
  tasklists: true,
  strikethrough: true,
  simplifiedAutoLink: true,
  parseImgDimensions: true,
  simpleLineBreaks: true
});

// 퍼센트 그래프 렌더링 컴포넌트
const PercentGraph: React.FC<{ text: string }> = ({ text }) => {
  console.log('텍스트 입력:', text);
  
  // 매우 간단한 정규식: 한글로 시작하고 숫자%가 포함되고 한글로 끝나는 패턴
  // 모든 대시 문자를 처리하고 공백 유무에 상관없이 매칭
  // .이 줄바꿈을 포함하지 않도록 s 플래그 제외
  const simplePattern = /([가-힣]+).*?(\d+)%.*?([가-힣]+)/;
  const match = text.match(simplePattern);
  
  console.log('정규식 매치 결과:', match);
  
  if (match) {
    const [, leftText, percentText, rightText] = match;
    const percent = parseInt(percentText, 10);
    
    console.log('추출된 데이터:', { leftText, percent, rightText });
    
    return (
      <div style={{ width: '100%' }}>
        <GraphTitle>{`${leftText} — ${rightText}`}</GraphTitle>
        <ProgressBarContainer>
          <ProgressBar percent={percent} />
          <PercentLabel>{percent}%</PercentLabel>
        </ProgressBarContainer>
      </div>
    );
  }
  
  // 패턴이 없으면 일반 텍스트로 렌더링
  return <p>{text}</p>;
};

// 디바운스 함수 추가
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 핵심 속성 안전하게 처리하는 유틸 함수
const safeToFixed = (value: any, digits: number = 2) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return Number(value).toFixed(digits);
};

const ResultCard: React.FC<ResultCardProps> = ({ result, onRetake, onSave, userName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [screenSize, setScreenSize] = useState<'extraSmall' | 'small' | 'medium' | 'large'>('medium');
  const [forCapture, setForCapture] = useState(false);
  const [gradientColor, setGradientColor] = useState('30, 30, 30');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showBackContent, setShowBackContent] = useState(false);
  const [contentTransitioning, setContentTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldWiggle, setShouldWiggle] = useState(false);
  const [startNumberAnimation, setStartNumberAnimation] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // AI 결과 상태 추가
  const [aiResult, setAiResult] = useState<{title: string; description: string}>({
    title: "AI 분석중입니다",
    description: "AI 분석 중입니다..."
  });

  // 전처리된 마크다운 컨텐츠를 담을 상태 추가
  const [processedDescription, setProcessedDescription] = useState<string>("");
  
  // 가장 높은 퍼센트를 가진 특성을 저장할 상태
  const [highestTrait, setHighestTrait] = useState<{leftText: string; rightText: string; percent: number} | null>(null);
  const [traitImage, setTraitImage] = useState<string>('');
  
  // 랜딩 애니메이션 상태
  const [animationState, setAnimationState] = useState({
    logoVisible: false,
    cardVisible: false,
    titleVisible: false,
    buttonsVisible: false,
    footerVisible: false
  });
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // 페이지 진입 시 한 번만 숫자 애니메이션 시작
  useEffect(() => {
    if (result && !hasAnimated) {
      setTimeout(() => {
        setStartNumberAnimation(true);
        setHasAnimated(true);
      }, 1000); // 카드가 나타난 후 1초 뒤에 시작
    }
  }, [result, hasAnimated]);
  
  // AI 분석 결과 가져오기
  useEffect(() => {
    if (result) {
      setIsLoading(true);
      let isCancelled = false; // 컴포넌트 언마운트 시 요청 취소를 위한 플래그
      let isRequesting = false; // 중복 요청 방지 플래그
      
      const fetchAIResult = async () => {
        // 이미 요청 중이면 중복 호출 방지
        if (isRequesting) {
          console.log('🚫 이미 API 요청 중 - 중복 호출 방지');
          return;
        }
        
        isRequesting = true;
        console.log('🎯 fetchAIResult 시작');
        
        try {
          const aiData = await getAIResult({
            ...result,
            userName: userName
          });
          
          // 컴포넌트가 언마운트되었으면 상태 업데이트 하지 않음
          if (!isCancelled) {
            setAiResult(aiData);
            setIsLoading(false);
            
            // 로딩이 완료되면 한 번만 카드 흔들림 애니메이션 실행
            setTimeout(() => {
              if (!isCancelled) {
                setShouldWiggle(true);
                
                // 애니메이션 완료 후 리셋 (애니메이션 지속 시간과 일치)
                setTimeout(() => {
                  if (!isCancelled) {
                    setShouldWiggle(false);
                  }
                }, 2000);
              }
            }, 1000);
          }
          
        } catch (error) {
          console.error("AI 결과 가져오기 오류:", error);
          if (!isCancelled) {
            setAiResult({
              title: "분석 오류",
              description: "분석 과정에서 오류가 발생했습니다. 다시 시도해주세요."
            });
            setIsLoading(false);
          }
        } finally {
          isRequesting = false;
        }
      };
      
      // fetchAIResult 함수를 딱 한 번만 호출
      fetchAIResult();
      
      // cleanup 함수로 요청 취소
      return () => {
        isCancelled = true;
        isRequesting = false;
      };
    }
  }, [result]);
  
  // AI 결과가 업데이트되면 전처리 수행
  useEffect(() => {
    if (aiResult.description) {
      try {
        // 먼저 마크다운을 HTML로 변환
        let htmlContent = converter.makeHtml(aiResult.description);
        
        // 퍼센트 패턴을 찾아서 저장할 배열
        let percentPatterns: {leftText: string; rightText: string; percent: number}[] = [];
        
        // 정규식 패턴 - '판단 - 85% - 유연' 같은 형식 찾기
        htmlContent = htmlContent.replace(
          /([가-힣]+)\s*[-—]\s*(\d+)%\s*[-—]\s*([가-힣]+)/g,
          (match, leftText, percentStr, rightText) => {
            const percent = parseInt(percentStr, 10);
            console.log('퍼센트 그래프 변환:', { match, leftText, percent, rightText });
            
            // 퍼센트 패턴 저장
            percentPatterns.push({ leftText, rightText, percent });
            
            return `<div class="percent-graph">
              <div class="graph-layout">
                <div class="graph-left-item">${rightText}</div>
                <div class="graph-middle">
                  <div class="graph-container">
                    <div class="graph-bar" style="width: ${percent}%;"></div>
                    <div class="graph-label">${percent}%</div>
                  </div>
                </div>
                <div class="graph-right-item">${leftText}</div>
              </div>
            </div>`;
          }
        );
        
        // 가장 높은 퍼센트 값을 가진 항목 찾기
        if (percentPatterns.length > 0) {
          const highest = percentPatterns.reduce((prev, current) => 
            (prev.percent > current.percent) ? prev : current
          );
          setHighestTrait(highest);
          
          // 특성에 해당하는 이미지 설정
          if (isValidTrait(highest.leftText)) {
            setTraitImage(getRandomTraitImage(highest.leftText));
          }
        }
        
        setProcessedDescription(htmlContent);
        console.log('전처리 완료');
        
        // 메모리 누수 방지를 위한 변수 정리
        percentPatterns = [];
        htmlContent = '';
        
      } catch (error) {
        console.error('처리 중 오류:', error);
        setProcessedDescription(converter.makeHtml(aiResult.description));
      }
    }
  }, [aiResult.description]);
  
  // 컴포넌트 마운트 시 랜덤 색상 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gradientColors.length);
    setGradientColor(gradientColors[randomIndex].value);
    
    // 랜딩 애니메이션 시작
    setTimeout(() => setAnimationState(prev => ({ ...prev, logoVisible: true })), 100);
    setTimeout(() => setAnimationState(prev => ({ ...prev, cardVisible: true })), 500); // 0.4초 후
    setTimeout(() => setAnimationState(prev => ({ ...prev, titleVisible: true })), 900); // 0.8초 후
    setTimeout(() => {
      setAnimationState(prev => ({ ...prev, buttonsVisible: true }));
      // 모든 애니메이션 완료 후 상호작용 활성화
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, footerVisible: true }));
        setAnimationComplete(true);
      }, 400);
    }, 1300); // 1.2초 후
  }, []);
  
  // 화면 크기에 따라 텍스트 크기 조정 - 최적화된 버전
  const handleResize = useCallback(debounce(() => {
    if (window.innerWidth < 360) {
      setScreenSize('extraSmall');
    } else if (window.innerWidth < 480) {
      setScreenSize('small');
    } else {
      setScreenSize('medium');
    }
  }, 100), []);
  
  useEffect(() => {
    // 초기 화면 크기 설정
    handleResize();
    
    // window resize 이벤트 추가
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  // body 스타일 설정을 위한 부수 효과
  React.useEffect(() => {
    // 원래 스타일 저장
    const originalStyle = document.body.style.cssText;
    
    // body에 스타일 적용
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#fff';
    
    // 컴포넌트 언마운트 시 복원 및 DOM 메모리 정리
    return () => {
      document.body.style.cssText = originalStyle;
      
      // DOM 메모리 누수 방지를 위한 강제 정리
      const markdownElements = document.querySelectorAll('.markdown-content');
      markdownElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.innerHTML = '';
        }
      });
      
      // 강제 가비지 컬렉션 유도
      if (window.gc) {
        window.gc();
      }
    };
  }, []);
  
  // 화면 캡처 함수 구현
  const captureScreen = () => {
    // 캡처를 위해 상태 설정
    setForCapture(true);
    
    // DOM 업데이트가 완료된 후 캡처 실행
    setTimeout(() => {
      // 카드만 캡처
      const targetElement = cardRef.current;
      
      if (targetElement) {
        html2canvas(targetElement, {
          scale: 2, // 2배 크기로 저장
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#000",
          logging: true,
        }).then(canvas => {
          // 캔버스를 이미지로 변환
          const image = canvas.toDataURL('image/png');
          
          // 다운로드 링크 생성
          const link = document.createElement('a');
          link.href = image;
          link.download = `관상데이터카드_${userName}_${new Date().toISOString().slice(0, 10)}.png`;
          
          // 다운로드 링크 클릭
          link.click();
          
          // 캡처 모드 해제
          setForCapture(false);
          
          // 원래 동작 수행
          onSave();
        }).catch(error => {
          console.error("캡처 오류:", error);
          setForCapture(false);
        });
      }
    }, 100); // DOM 업데이트를 위한 짧은 지연
  };
  
  // 애니메이션 중에는 클릭을 비활성화하는 카드 플립 핸들러
  const handleCardFlip = () => {
    if (contentTransitioning || !animationComplete || shouldWiggle) return;
    
    setContentTransitioning(true);
    
    if (!isFlipped) {
      // 앞면에서 뒷면으로 전환
      setShowBackContent(false); // 먼저 뒷면 콘텐츠 숨김
      setIsFlipped(true); // 그 다음 카드 뒤집기
      
      // 카드가 뒤집히고 나서 콘텐츠 표시
      setTimeout(() => {
        setShowBackContent(true);
        setContentTransitioning(false);
      }, 600);
    } else {
      // 뒷면에서 앞면으로 전환
      setIsFlipped(false);
      setTimeout(() => {
        setContentTransitioning(false);
      }, 500);
    }
  };
  
  if (!result) return null;

  return (
    <>
      <GlobalStyle />
      <CaptureStyles forCapture={forCapture} />
      <MarkdownStyles />
      <WiggleEffectStyle shouldWiggle={shouldWiggle} />
      <Container ref={containerRef}>
        <CardWrapper 
          ref={cardRef} 
          isFlipped={isFlipped} 
          isVisible={animationState.cardVisible}
          isLoading={isLoading}
          className={`card-wrapper ${shouldWiggle ? 'wiggling' : ''}`}
          onClick={animationComplete && !isLoading ? handleCardFlip : undefined}
        >
          <GradientOverlay color={gradientColor} />
          <CardLogo isVisible={animationState.logoVisible}>
            <img src={`${process.env.PUBLIC_URL}/images/icon/logo-white.png`} alt="관상 로고" style={{ height: '40px', opacity: 0.3}} />
          </CardLogo>
          <CardFront isFlipped={isFlipped} id="card-front">
            {!isFlipped && (
              <>
                <FullScreenCard>
                  <FaceContainer>
                    {/* 배경 이미지를 항상 표시 */}
                    <FaceImage src={`${process.env.PUBLIC_URL}/images/result_face.png`} alt="Face Analysis" />
                    
                    {/* 로딩 영상은 항상 표시하되, 로딩 완료 시 투명하게 처리 */}
                    <LoadingVideo 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      style={{ opacity: isLoading ? 1 : 0 }}
                    >
                      <source src={`${process.env.PUBLIC_URL}/videos/loading.mp4`} type="video/mp4" />
                    </LoadingVideo>
                    
                    {/* 상단 측정 결과 */}
                    <DataItem top="12%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>얼굴 너비-높이 비율</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.displayFaceRatio || 0.7} format={(v) => v.toFixed(2)} delay={500} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 왼쪽 상단 */}
                    <DataItem top="33%" left="15%" textAlign="left" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>왼쪽 눈 색상</DataLabel>
                      <ColorCircle color={result?.eyeIrisColor_L || '#130603'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                    
                    {/* 오른쪽 상단 */}
                    <DataItem top="33%" right="15%" textAlign="right" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>오른쪽 눈 색상</DataLabel>
                      <ColorCircle color={result?.eyeIrisColor_R || '#190705'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                    
                    {/* 얼굴 대칭성 */}
                    <DataItem top="20%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>얼굴 대칭성</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.displaySymmetryScore || 85} format={(v) => `${v.toFixed(0)}%`} delay={700} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 왼쪽 중앙 */}
                    <DataItem top="27%" left="12%" textAlign="left" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>왼쪽 눈 기울기</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.eyeAngleDeg_L} format={(v) => `${v.toFixed(1)}°`} delay={900} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 오른쪽 중앙 */}
                    <DataItem top="27%" right="12%" textAlign="right" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>오른쪽 눈 기울기</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.eyeAngleDeg_R} format={(v) => `${v.toFixed(1)}°`} delay={900} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 눈 사이 거리 */}
                    <DataItem top="27%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>눈 사이 거리</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.eyeDistanceRatio} format={(v) => v.toFixed(2)} delay={1100} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 코 길이 */}
                    <DataItem top="33%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>코 길이</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.displayNoseLength || result.noseLength} format={(v) => v.toFixed(2)} delay={1300} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 코 높이 */}
                    <DataItem top="40%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>코 높이</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.displayNoseHeight || result.noseHeight} format={(v) => v.toFixed(2)} delay={1500} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 왼쪽 콧망울 */}
                    <DataItem top="40%" left="20%" textAlign="left" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>왼쪽 콧망울 크기</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.nostrilSize_L} format={(v) => v.toFixed(2)} delay={1700} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 오른쪽 콧망울 */}
                    <DataItem top="40%" right="20%" textAlign="right" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>오른쪽 콧망울 크기</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.nostrilSize_R} format={(v) => v.toFixed(2)} delay={1700} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 아랫입술 두께 */}
                    <DataItem top="50%" left="50%" style={{ transform: 'translateX(-50%)' }} screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>아랫입술 두께</DataLabel>
                      <DataValue screenSize={screenSize}>
                        {result && <AnimatedNumber value={result.displayLowerLipThickness || result.lowerLipThickness} format={(v) => v.toFixed(2)} delay={1900} shouldStart={startNumberAnimation} />}
                      </DataValue>
                    </DataItem>
                    
                    {/* 피부 색상 */}
                    <DataItem bottom="40%" left="25%" textAlign="center" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>피부 색상</DataLabel>
                      <ColorCircle color={result?.skinToneColor || '#c6b7b0'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                    
                    {/* 다크서클 색상 */}
                    <DataItem bottom="40%" right="25%" textAlign="center" screenSize={screenSize}>
                      <DataLabel screenSize={screenSize}>다크서클 색상</DataLabel>
                      <ColorCircle color={result?.eyeDarkCircleColor || '#807673'} style={{ margin: '0 auto' }} screenSize={screenSize} />
                    </DataItem>
                  </FaceContainer>
                </FullScreenCard>
                <InterpretText isVisible={animationState.titleVisible}>
                  <ReactMarkdown components={{
                    h1: ({node, ...props}) => <span className="interpret-title" {...props} />
                  }}>
                    {isLoading ? "AI 분석중입니다" : "카드를 넘겨 분석 내용을 확인하세요"}
                  </ReactMarkdown>
                </InterpretText>
              </>
            )}
          </CardFront>
          
          <CardBack isFlipped={isFlipped} id="card-back">
            <CardBackContent style={{ opacity: showBackContent ? 1 : 0 }}>
              {highestTrait && (
                <>
                  {traitImage && (
                    <ImageContainer>
                      <TraitTitle>
                        <ReactMarkdown components={{
                          h1: ({node, ...props}) => <span className="interpret-title" {...props} />
                        }}>
                        {aiResult.title}
                        </ReactMarkdown>
                      </TraitTitle>
                      <TraitImage src={traitImage} alt={highestTrait.leftText} />
                    </ImageContainer>
                  )}
                  {!traitImage && (
                    <HighestTraitTitle>
                      {highestTrait.leftText}
                    </HighestTraitTitle>
                  )}
                </>
              )}
              <CardBackDescription>
                <div 
                  className="markdown-content" 
                  dangerouslySetInnerHTML={{ 
                    __html: processedDescription || aiResult.description
                  }} 
                />
              </CardBackDescription>
            </CardBackContent>
          </CardBack>
        </CardWrapper>
        
        {/* <ButtonsContainer isVisible={animationState.buttonsVisible}>
          <Button onClick={onRetake}>
            <img src={`${process.env.PUBLIC_URL}/images/icon/retake.png`} alt="다시 찍기" />
          </Button>
          {!isLoading && (
            <Button onClick={animationComplete ? handleCardFlip : undefined} isRotated={isFlipped}>
              <img src={`${process.env.PUBLIC_URL}/images/icon/flip.png`} alt="카드 뒤집기" />
            </Button>
          )}
        </ButtonsContainer> */}

        <Footer isVisible={animationState.footerVisible}>
          <Copyright>© 2025 eeezeen. All rights reserved.</Copyright>
        </Footer>
      </Container>
    </>
  );
};

export default ResultCard; 