import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface AnalysisButtonProps {
  show: boolean;
  onClick?: () => void;
}

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ButtonContainer = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 330px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(234, 213, 161, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  animation: ${({ show }) => (show ? fadeInUp : 'none')} 0.5s ease-out forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const AnalysisButton: React.FC<AnalysisButtonProps> = ({ show, onClick }) => {
  return (
    <ButtonContainer show={show} onClick={onClick}>
      Analysis
    </ButtonContainer>
  );
};

export default AnalysisButton; 