// 이미지 매핑 타입 정의
type ImageMapping = {
  [key: string]: string[];
};

// 이미지 매핑 객체
const imageMapping: ImageMapping = {
  '유연': ['yy1.png', 'yy2.png', 'yy3.png'],
  '판단': ['pd1.png', 'pd2.png', 'pd3.png', 'pd4.png', 'pd5.png', 'pd6.png'],
  '관찰': ['kc1.png', 'kc2.png', 'kc3.png'],
  '공감': ['gg1.png', 'gg2.png', 'gg3.png', 'gg4.png', 'gg5.png', 'gg6.png'],
  '탐색': ['ts1.png', 'ts2.png', 'ts3.png'],
  '추진': ['cz1.png', 'cz2.png', 'cz3.png', 'cz4.png', 'cz5.png', 'cz6.png'],
  '성찰': ['sc1.png', 'sc2.png', 'sc3.png'],
  '인식': ['is1.png', 'is2.png', 'is3.png'],
  '집중': ['zz1.png', 'zz2.png', 'zz3.png'],
  '직관': ['zk1.png', 'zk2.png', 'zk3.png'],
  '사고': ['sg1.png', 'sg2.png', 'sg3.png', 'sg4.png', 'sg5.png', 'sg6.png']
};

/**
 * 주어진 특성에 해당하는 랜덤 이미지를 반환합니다.
 * @param trait 특성 텍스트
 * @returns 랜덤으로 선택된 이미지 경로
 */
export const getRandomTraitImage = (trait: string): string => {
  const images = imageMapping[trait];
  if (!images) {
    console.warn(`해당하는 이미지가 없습니다: ${trait}`);
    return '';
  }
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return `${process.env.PUBLIC_URL}/images/face/${images[randomIndex]}`;
};

/**
 * 특성이 유효한지 확인합니다.
 * @param trait 확인할 특성 텍스트
 * @returns 유효한 특성인지 여부
 */
export const isValidTrait = (trait: string): boolean => {
  return trait in imageMapping;
}; 