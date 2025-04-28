import React from 'react';
import styled from 'styled-components';

interface FeatureBarProps {
  label: string;
  value: number; // 0-1 사이 값
  displayValue?: string;
  color?: string;
  maxValue?: number;
}

// 값에 따른 색상 결정 함수
const getValueColor = (value: number, theme: any) => {
  if (value >= 0.7) return theme.colors.graph.high;
  if (value >= 0.4) return theme.colors.graph.medium;
  return theme.colors.graph.low;
};

// 컨테이너
const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

// 라벨
const Label = styled.span`
  flex: 0 0 30%;
  font-size: ${({ theme }) => theme.fonts.size.small};
  color: ${({ theme }) => theme.colors.text};
  margin-right: ${({ theme }) => theme.spacing.xs};
  text-align: right;
`;

// 그래프 컨테이너
const BarContainer = styled.div`
  flex: 1;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.features.featureBarBg};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

// 그래프 바
interface BarProps {
  value: number;
  maxValue: number;
  color?: string;
}

const Bar = styled.div<BarProps>`
  height: 100%;
  width: ${({ value, maxValue }) => `${Math.min(100, (value / maxValue) * 100)}%`};
  background-color: ${({ color, value, theme }) => color || getValueColor(value, theme)};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: width ${({ theme }) => theme.transitions.short};
`;

// 값 표시
const Value = styled.span`
  flex: 0 0 50px;
  font-size: ${({ theme }) => theme.fonts.size.small};
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
`;

/**
 * 특성 바 컴포넌트
 * 특성 이름과 값을 시각적으로 표시합니다.
 */
const FeatureBar: React.FC<FeatureBarProps> = ({
  label,
  value,
  displayValue,
  color,
  maxValue = 1
}) => {
  // 값이 최소값보다 작으면 최소값으로 조정
  const MIN_BAR_WIDTH_RATIO = 0.05; // 5%
  const adjustedValue = value > 0 && value < maxValue * MIN_BAR_WIDTH_RATIO
    ? maxValue * MIN_BAR_WIDTH_RATIO
    : value;

  return (
    <Container>
      <Label>{label}</Label>
      <BarContainer>
        <Bar value={adjustedValue} maxValue={maxValue} color={color} />
      </BarContainer>
      <Value>{displayValue || value.toFixed(2)}</Value>
    </Container>
  );
};

export default FeatureBar; 