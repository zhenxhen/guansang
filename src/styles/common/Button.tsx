import styled, { css } from 'styled-components';
import { Theme } from '../theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  theme?: Theme;
}

/**
 * 버튼 베이스 스타일
 */
const baseButtonStyle = css<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-family: ${({ theme }) => theme.fonts.family.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
`;

/**
 * 버튼 크기 스타일
 */
const buttonSizeStyles = {
  small: css`
    padding: 6px 12px;
    font-size: ${({ theme }: ButtonProps) => theme?.fonts.size.small};
  `,
  medium: css`
    padding: 8px 16px;
    font-size: ${({ theme }: ButtonProps) => theme?.fonts.size.medium};
  `,
  large: css`
    padding: 12px 24px;
    font-size: ${({ theme }: ButtonProps) => theme?.fonts.size.large};
  `
};

/**
 * 버튼 변형 스타일
 */
const buttonVariantStyles = {
  primary: css`
    background-color: ${({ theme }: ButtonProps) => theme?.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }: ButtonProps) => {
        const color = theme?.colors.primary;
        // 색상을 약간 어둡게
        return color ? `${color}dd` : color;
      }};
    }
  `,
  secondary: css`
    background-color: ${({ theme }: ButtonProps) => theme?.colors.secondary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }: ButtonProps) => {
        const color = theme?.colors.secondary;
        // 색상을 약간 어둡게
        return color ? `${color}dd` : color;
      }};
    }
  `,
  outline: css`
    background-color: transparent;
    border: 2px solid ${({ theme }: ButtonProps) => theme?.colors.primary};
    color: ${({ theme }: ButtonProps) => theme?.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 127, 139, 0.1);
    }
  `,
  text: css`
    background-color: transparent;
    color: ${({ theme }: ButtonProps) => theme?.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 127, 139, 0.1);
    }
  `
};

/**
 * 스타일드 버튼 컴포넌트
 */
const Button = styled.button<ButtonProps>`
  ${baseButtonStyle}
  
  /* 크기 스타일 적용 */
  ${({ size = 'medium' }) => buttonSizeStyles[size]}
  
  /* 변형 스타일 적용 */
  ${({ variant = 'primary' }) => buttonVariantStyles[variant]}
`;

export default Button; 