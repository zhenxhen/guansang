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

// 재시도 함수
const retryWithDelay = async (fn: () => Promise<any>, retries: number = 2, delay: number = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithDelay(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const getAIResult = async (data: ResultProps): Promise<AIResult> => {
  try {
    // 환경변수 확인
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const model = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-mini';
    const systemPrompt = process.env.REACT_APP_OPENAI_SYSTEM_PROMPT;
    
    // 필수 환경변수 검증
    if (!apiKey) {
      throw new Error('서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.');
    }
    
    if (!systemPrompt) {
      throw new Error('서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.');
    }

    // 입력 데이터 준비
    const inputData = `
    - username : ${data.userName || '사용자'}
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

    // API 호출 함수
    const makeAPICall = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
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
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 401) {
            throw new Error('인증에 실패했습니다.');
          } else if (response.status === 429) {
            throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
          } else if (response.status >= 500) {
            throw new Error('서버에 일시적인 문제가 있습니다.');
          } else {
            throw new Error(`분석 요청에 실패했습니다. (${response.status})`);
          }
        }

        // JSON 파싱 후 강제 참조 해제로 메모리 누수 방지
        const result = await response.json();
        
        // 강제 가비지 컬렉션을 위한 참조 해제
        (response as any) = null;
        controller.abort(); // AbortController 정리
        
        return result;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        controller.abort(); // 에러 시에도 AbortController 정리
        
        if (fetchError.name === 'AbortError') {
          throw new Error('요청 시간이 초과되었습니다.');
        }
        throw fetchError;
      }
    };

    // 재시도 로직과 함께 API 호출
    const result = await retryWithDelay(makeAPICall, 2, 1000);
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('분석 결과를 받지 못했습니다.');
    }

    // 응답 처리
    const resultText = result.choices[0].message.content;
    if (!resultText) {
      throw new Error('분석 결과가 비어있습니다.');
    }

    const lines = resultText.toString().split('\n');
    const title = lines[0]?.trim() || '분석 완료';
    const description = lines.slice(1).join('\n').trim() || '분석이 완료되었습니다.';

    // 사용자명 치환
    const userName = data.userName || '사용자';
    const formattedTitle = title.replace(/username/g, userName);
    const formattedDescription = description.replace(/username/g, userName);

    // 메모리 정리를 위한 변수 해제
    (result as any) = null;
    (lines as any) = null;

    return {
      title: formattedTitle,
      description: formattedDescription
    };

  } catch (error: any) {
    console.error('AI 분석 오류:', error.message);
    
    // 사용자 친화적인 에러 메시지 반환
    if (error.message.includes('인증')) {
      throw new Error('서비스 인증에 문제가 있습니다. 관리자에게 문의해주세요.');
    } else if (error.message.includes('요청이 너무 많습니다')) {
      throw new Error('현재 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message.includes('시간이 초과')) {
      throw new Error('분석 시간이 초과되었습니다. 다시 시도해주세요.');
    } else if (error.message.includes('네트워크') || error.name === 'TypeError') {
      throw new Error('네트워크 연결을 확인해주세요.');
    } else if (error.message.includes('서비스 설정')) {
      throw error; // 설정 오류는 그대로 전달
    } else {
      throw new Error('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
}; 