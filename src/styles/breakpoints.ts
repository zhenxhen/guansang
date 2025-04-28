/**
 * 반응형 디자인을 위한 미디어 쿼리 중단점 정의
 */
import { BREAKPOINT_MOBILE, BREAKPOINT_TABLET } from '../constants/UIConstants';

// 중단점 크기 (픽셀)
export const breakpointSizes = {
  mobile: BREAKPOINT_MOBILE,     // 모바일 중단점 (768px)
  tablet: BREAKPOINT_TABLET,     // 태블릿 중단점 (1024px)
  desktop: BREAKPOINT_TABLET + 1 // 데스크톱 중단점 (1025px 이상)
};

// 미디어 쿼리 생성 함수
const mediaQuery = (size: number): string => `@media (min-width: ${size}px)`;

/**
 * styled-components에서 사용할 수 있는 미디어 쿼리 객체
 * 사용 예:
 * const Box = styled.div`
 *   width: 100%;
 *   ${media.tablet`
 *     width: 50%;
 *   `}
 *   ${media.desktop`
 *     width: 33%;
 *   `}
 * `;
 */
export const media = {
  mobile: (styles: TemplateStringsArray, ...args: any[]): string => {
    return mediaQuery(breakpointSizes.mobile) + ' { ' + 
      styles.reduce((acc, style, i) => acc + style + (args[i] || ''), '') + 
    ' }';
  },
  tablet: (styles: TemplateStringsArray, ...args: any[]): string => {
    return mediaQuery(breakpointSizes.tablet) + ' { ' + 
      styles.reduce((acc, style, i) => acc + style + (args[i] || ''), '') + 
    ' }';
  },
  desktop: (styles: TemplateStringsArray, ...args: any[]): string => {
    return mediaQuery(breakpointSizes.desktop) + ' { ' + 
      styles.reduce((acc, style, i) => acc + style + (args[i] || ''), '') + 
    ' }';
  }
};

/**
 * useState, useEffect 등에서 사용하기 쉬운 미디어 쿼리 체크 함수
 */
export const isMatchMedia = {
  mobile: (): boolean => window.matchMedia(`(max-width: ${breakpointSizes.tablet - 1}px)`).matches,
  tablet: (): boolean => window.matchMedia(`(min-width: ${breakpointSizes.mobile}px) and (max-width: ${breakpointSizes.desktop - 1}px)`).matches,
  desktop: (): boolean => window.matchMedia(`(min-width: ${breakpointSizes.desktop}px)`).matches
};

/**
 * 현재 화면 크기에 따른 디바이스 타입 반환
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMatchMedia.desktop()) return 'desktop';
  if (isMatchMedia.tablet()) return 'tablet';
  return 'mobile';
}; 