import OpenAI from "openai";

interface ResultProps {
  faceRatio: number;
  symmetryScore: number;
  eyeAngleDeg_L: number;
  eyeAngleDeg_R: number;
  eyeDistanceRatio: number;
  noseLength: number;
  noseHeight: number;
  nostrilSize_L: number;
  nostrilSize_R: number;
  lowerLipThickness: number;
  eyeIrisColor_L: string;
  eyeIrisColor_R: string;
  eyeDarkCircleColor: string;
  skinToneColor: string;
  userName?: string;
  displayFaceRatio?: number;
  displaySymmetryScore?: number;
  displayNoseLength?: number;
  displayNoseHeight?: number;
  displayLowerLipThickness?: number;
}

interface AIResult {
  title: string;
  description: string;
}

// 오류 유형 정의
export enum ErrorType {
  API_KEY_MISSING = 1,
  API_REQUEST_FAILED = 2,
  API_RESPONSE_EMPTY = 3,
  API_PARSING_ERROR = 4,
  MODEL_NOT_FOUND = 5,
  NETWORK_ERROR = 6,
  TIMEOUT_ERROR = 7,
  UNKNOWN_ERROR = 8,
  INVALID_PARAMETERS = 9,
  SERVER_ERROR = 10
}

export const getAIResult = async (data: ResultProps): Promise<AIResult> => {
  try {
    // API 키 확인
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    // 모델과 시스템 프롬프트를 환경변수에서 가져오기
    const model = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4.1-nano';
    const systemPrompt = process.env.REACT_APP_OPENAI_SYSTEM_PROMPT;
    
    if (!systemPrompt) {
      throw new Error('시스템 프롬프트가 설정되지 않았습니다.');
    }

    // 입력 데이터를 문자열로 변환 - 이미 플랫폼별로 계산된 값들을 우선 사용
    const inputData = `
    - username : ${data.userName}
    - 얼굴 너비-높이 비율: ${(data.displayFaceRatio || data.faceRatio).toFixed(2)}  
    - 얼굴 대칭성: ${(data.displaySymmetryScore || data.symmetryScore).toFixed(0)}%  
    - 눈 기울기 좌/우: ${data.eyeAngleDeg_L.toFixed(1)}° / ${data.eyeAngleDeg_R.toFixed(1)}°  
    - 눈 사이 거리 비율: ${data.eyeDistanceRatio.toFixed(2)}  
    - 코 길이: ${(data.displayNoseLength || data.noseLength).toFixed(2)}  
    - 코 높이: ${(data.displayNoseHeight || data.noseHeight).toFixed(2)}  
    - 콧망울 크기 좌/우: ${data.nostrilSize_L.toFixed(2)} / ${data.nostrilSize_R.toFixed(2)}  
    - 아랫입술 두께: ${(data.displayLowerLipThickness || data.lowerLipThickness).toFixed(2)}  
    - 왼쪽 눈동자 색상: ${data.eyeIrisColor_L}  
    - 오른쪽 눈동자 색상: ${data.eyeIrisColor_R}  
    - 다크서클 색상: ${data.eyeDarkCircleColor}  
    - 피부 색상: ${data.skinToneColor}  
    `;

    console.log('AI API에 전송되는 데이터:', inputData);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: inputData
          }
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API 응답 오류:', response.status, errorData);
      
      if (response.status === 401) {
        throw new Error('API 키가 유효하지 않습니다.');
      } else if (response.status === 429) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      } else if (response.status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    // 응답 텍스트의 첫 번째 줄을 제목으로, 나머지를 설명으로 분리
    const resultText = result.choices[0].message.content;
    const lines = resultText.toString().split('\n');
    const title = lines[0].trim();
    const description = lines.slice(1).join('\n').trim();

    // 데이터 검증: 실제 결과가 있는지 확인
    if (!title || !description) {
      throw new Error('API 응답이 유효한 형식이 아닙니다.');
    }
    
    // username 값을 제목에 반영
    const formattedTitle = title.replace('username', data.userName);
    const formattedDescription = description.replace(/username/g, data.userName);

    return {
      title: formattedTitle,
      description: formattedDescription
    };

  } catch (error: any) {
    console.error('AI 결과 생성 오류:', error);
    
    // 에러 타입에 따른 적절한 메시지 반환
    if (error.message.includes('API 키')) {
      throw error;
    } else if (error.message.includes('네트워크') || error.name === 'TypeError') {
      throw new Error('네트워크 연결을 확인해주세요.');
    } else if (error.message.includes('timeout')) {
      throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    } else {
      throw new Error('분석 결과 생성 중 오류가 발생했습니다.');
    }
  }
}; 