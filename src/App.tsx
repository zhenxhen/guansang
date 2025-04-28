import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import './App.css';
import WebcamDetection from './components/WebcamDetection';

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  
  * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    box-sizing: border-box;
  }
  
  html, body {
    touch-action: manipulation;
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
  }
`;

function App() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    // 확대/축소 방지를 위한 이벤트 처리
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventZoomOnDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      
      if (now - lastTap < 300) {
        e.preventDefault();
      }
      
      lastTap = now;
    };

    let lastTap = 0;
    
    // 이벤트 리스너 등록
    document.addEventListener('touchstart', preventZoomOnDoubleTap, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });
    
    // 키보드 단축키로 인한 확대/축소 방지
    const preventZoomKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', preventZoomKey);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', preventZoomOnDoubleTap);
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('keydown', preventZoomKey);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <div className="App">
        <section id="demos" className={isVisible ? '' : 'invisible'}>
          <WebcamDetection />
        </section>
      </div>
    </>
  );
}

export default App;
