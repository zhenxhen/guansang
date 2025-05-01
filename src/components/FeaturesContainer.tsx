import React from 'react';
import styled from 'styled-components';
import { FaceFeatures } from './FaceAnalysisBox';

interface FeatureItemProps {
  label: string;
  value: number | string;
  color?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
`;

const CategoryTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const FeatureItem = styled.div<{ color?: string }>`
  display: flex;
  flex-direction: column;
  padding: 8px;
  background-color: ${props => props.color || '#f5f5f5'};
  border-radius: 6px;
`;

const FeatureLabel = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const FeatureValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const FeatureItemComponent: React.FC<FeatureItemProps> = ({ label, value, color }) => {
  return (
    <FeatureItem color={color}>
      <FeatureLabel>{label}</FeatureLabel>
      <FeatureValue>{typeof value === 'number' ? value.toFixed(2) : value}</FeatureValue>
    </FeatureItem>
  );
};

interface FeatureContainerProps {
  faceFeatures: FaceFeatures | null;
}

const FeaturesContainer: React.FC<FeatureContainerProps> = ({ faceFeatures }) => {
  if (!faceFeatures) {
    return null;
  }

  return (
    <Container>
      <div>
        <CategoryTitle>얼굴 비율</CategoryTitle>
        <FeatureGrid>
          <FeatureItemComponent label="얼굴 너비" value={faceFeatures.faceWidth} />
          <FeatureItemComponent label="얼굴 높이" value={faceFeatures.faceHeight} />
          <FeatureItemComponent 
            label="너비/높이 비율" 
            value={faceFeatures.fWHR} 
            color={faceFeatures.fWHR > 1.9 ? '#ffede0' : '#e0ffed'}
          />
          <FeatureItemComponent 
            label="대칭 점수" 
            value={faceFeatures.fSR} 
            color={faceFeatures.fSR > 0.95 ? '#e0ffed' : '#ffede0'}
          />
        </FeatureGrid>
      </div>
      
      <div>
        <CategoryTitle>코</CategoryTitle>
        <FeatureGrid>
          <FeatureItemComponent label="코 높이" value={faceFeatures.noseHeight} />
          <FeatureItemComponent label="콧구멍 좌" value={faceFeatures.nostrilSize_L} />
          <FeatureItemComponent label="콧구멍 우" value={faceFeatures.nostrilSize_R} />
          <FeatureItemComponent label="콧구멍 차이" value={Math.abs(faceFeatures.nostrilSize_L - faceFeatures.nostrilSize_R)} />
        </FeatureGrid>
      </div>
      
      <div>
        <CategoryTitle>눈</CategoryTitle>
        <FeatureGrid>
          <FeatureItemComponent label="눈 각도 좌" value={faceFeatures.leftEyeAngle} />
          <FeatureItemComponent label="눈 각도 우" value={faceFeatures.rightEyeAngle} />
          <FeatureItemComponent label="눈 사이 거리" value={faceFeatures.eyeDistance ?? 0} />
          <FeatureItemComponent 
            label="눈 각도 차이" 
            value={Math.abs(faceFeatures.leftEyeAngle - faceFeatures.rightEyeAngle)}
            color={Math.abs(faceFeatures.leftEyeAngle - faceFeatures.rightEyeAngle) < 2 ? '#e0ffed' : '#ffede0'}
          />
        </FeatureGrid>
      </div>
    </Container>
  );
};

export default FeaturesContainer; 