import styled, { css } from 'styled-components';

interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

/**
 * 카드의 패딩 스타일
 */
const cardPaddingStyles = {
  none: css`
    padding: 0;
  `,
  small: css`
    padding: ${({ theme }) => theme.spacing.sm};
  `,
  medium: css`
    padding: ${({ theme }) => theme.spacing.md};
  `,
  large: css`
    padding: ${({ theme }) => theme.spacing.lg};
  `,
};

/**
 * 카드 변형 스타일
 */
const cardVariantStyles = {
  default: css`
    background-color: ${({ theme }) => theme.colors.ui.cardBackground};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  `,
  outlined: css`
    background-color: ${({ theme }) => theme.colors.ui.cardBackground};
    border: 1px solid ${({ theme }) => theme.colors.ui.cardBorder};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  `,
  elevated: css`
    background-color: ${({ theme }) => theme.colors.ui.cardBackground};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadows.medium};
  `,
};

/**
 * 카드 컴포넌트
 */
const Card = styled.div<CardProps>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ padding = 'medium' }) => cardPaddingStyles[padding]}
  ${({ variant = 'default' }) => cardVariantStyles[variant]}
`;

export default Card; 