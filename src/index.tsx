import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 모바일 확대/축소 이벤트 방지
const preventZoomOnIOS = () => {
  // iOS에서 더블탭 및 핀치 동작 방지
  document.addEventListener('touchmove', (e) => {
    // 두 손가락 이상 사용 시 이벤트 방지 (핀치 줌)
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // 더블탭 줌 방지
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // 페이지 확대/축소 막기 위한 스케일 고정
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  }, { passive: false });
};

// 브라우저 확대/축소 방지
const preventBrowserZoom = () => {
  // Ctrl+휠 이벤트 방지
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Ctrl+키보드 +/- 이벤트 방지
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_' || e.key === '0')) {
      e.preventDefault();
    }
  });
};

// 이벤트 실행
preventZoomOnIOS();
preventBrowserZoom();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
