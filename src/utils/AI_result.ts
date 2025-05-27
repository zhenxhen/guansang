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
    // 환경 변수에서 API 키를 가져옵니다
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OpenAI API 키가 설정되지 않았습니다");
      return {
        title: `분석 오류(${ErrorType.API_KEY_MISSING})`,
        description: "API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
      };
    }

    // 입력 데이터 검증
    if (!data || !data.faceRatio || !data.symmetryScore) {
      console.error("유효하지 않은 분석 데이터:", data);
      return {
        title: `분석 오류(${ErrorType.INVALID_PARAMETERS})`,
        description: "얼굴 분석 데이터가 유효하지 않습니다. 다시 시도해주세요."
      };
    }

    // 디바이스 타입 감지 함수 (FaceAnalysisBox와 동일한 로직)
    const detectDeviceType = (): string => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'iOS';
      } else if (/android/.test(userAgent)) {
        return 'Android';
      } else {
        return 'PC';
      }
    };

    const currentDeviceType = detectDeviceType();

    // UI에서 실제로 표시되는 값들을 계산 (FaceAnalysisBox와 동일한 로직)
    let displayNoseHeight = data.noseHeight;
    let displayNoseLength = data.noseLength;
    let displayLowerLipThickness = data.lowerLipThickness;

    // 모바일 디바이스인 경우 UI 표시용 변환 적용 (FaceAnalysisBox와 동일)
    if (currentDeviceType === 'iOS' || currentDeviceType === 'Android') {
      displayNoseHeight = displayNoseHeight / 3; // 코 높이 계산에 /3
      displayNoseLength = displayNoseLength * 3; // 코 길이 계산에 *3
      displayLowerLipThickness = displayLowerLipThickness * 3; // 밑 입술 계산에 *3
    }

    // 입력 데이터를 문자열로 변환 (UI에서 실제로 표시되는 값 사용)
    const inputData = `
    - 얼굴 너비-높이 비율: ${(data.displayFaceRatio || data.faceRatio).toFixed(2)}  
    - 얼굴 대칭성: ${(data.displaySymmetryScore || data.symmetryScore).toFixed(0)}%  
    - 눈 기울기 좌/우: ${data.eyeAngleDeg_L.toFixed(1)}° / ${data.eyeAngleDeg_R.toFixed(1)}°  
    - 눈 사이 거리: ${data.eyeDistanceRatio.toFixed(2)}  
    - 코 길이: ${displayNoseLength.toFixed(2)}  
    - 코 높이: ${displayNoseHeight.toFixed(2)}  
    - 왼쪽 콧망울: ${data.nostrilSize_L.toFixed(2)}  
    - 오른쪽 콧망울: ${data.nostrilSize_R.toFixed(2)}  
    - 아랫입술 두께: ${displayLowerLipThickness.toFixed(2)}  
    - 왼쪽 눈 색상: ${data.eyeIrisColor_L}  
    - 오른쪽 눈 색상: ${data.eyeIrisColor_R}  
    - 다크서클 색상: ${data.eyeDarkCircleColor}  
    - 피부 색상: ${data.skinToneColor}
    `;

    // API 요청 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    // fetch API를 이용한 curl 스타일 요청
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content: "당신은 얼굴 데이터를 해석하는 감성 전략 분석가이자, 관상학과 심리학을 접목한 퍼스널리티 리서처입니다.  \n입력된 수치 기반으로, 전통적인 한자어 개념과 현대 심리학·UX적 감성 언어를 융합하여 사용자의 성향, 기질, 가능성을 종합 분석한 글을 작성하세요.또한 강인하고, 직접적인 말투로 \"자극적\"으로 작성하세요. 적당한 비판이 있어야 합니다.\n레포트 형식의 글입니다. 주제 외에 추가적인 이야기는 하지마세요.\n\n문체는 다음을 기준으로 합니다:\n- 단순한 수치 해석이 아니라, **전문성과 서사성**이 어우러진 에세이 느낌  \n- 전통 개념을 용어로 최대한 많이 활용하되, 부연 설명 포함  \n- 감성적이되 신뢰감있게 과학적으로 보일 것  \n- 독자가 자신의 얼굴에 대한 통찰을 얻고 '자기 이해'에 도달하도록 유도\n\n\n-\n\n각 항목당 제목들을 간단하게 작성 후 설명을 진행하세요, H1 스타일.\n각 설명에서 구체적인 수치를 언급하지말고, 추상적으로 설명하세요.\n불렛포인트는 절대 작성하지 말것.\n각 대제목 관련된 내용이 끝나면 divider로 구분하세요.(*첫 문단 제외)\n강점과 약점의 중제목은 최대한 감성적인 표현을 쓰며 구체적인 수치 및 수치값에 대해서 언급하지 말고, 설명은 이성적이고 전문적, 자극적으로 작성하세요.\n\n\n가장 최상단에 10글자 이내로 인물의 이름을 포함하여 인물의 캐릭터를 간단히 설명하세요. 호기심을 자극할 자극적인 카피라이팅. 가장 굵은 텍스트 스타일. User name을 먼저 얘기하고, 그 뒤에 표현하는 방식으로\nex. username, 강인함의 표상\n\n **username의 관상**  \n한줄 평을 바디 텍스트로 적으세요.\n\n **능력치 분석** \n아래 형식으로 핵심 역량을 수치화하세요. 역량A-00%-역량B (0~100%). A와 B의 내용은 아래 적힌 내용과 동일하게 입력하세요. 임의로 역량이름을 바꾸지 마세요. %는 역량B에 대한 역량을 기준으로 %로 나타내세요. 0~100%은 어떠한 긍정도 부정도 없습니다, 따라서 수치를 0~100% 사이에 고르게 분포할 수 있게 배치하세요. \n이때 해석은 수치 기반 해석과 연결하여 전문가처럼 정리해주세요.\n*판단 - 00% - 유연*\n얼굴 비율 안정성, 시야 넓이, 중정 구조 등 기반\n\n*공감 - 00% - 관찰\n눈동자 색, 피부톤, 눈 간격 등 해석 중심\n*추진 - 00% - 탐색 \n鼻長, 鼻高, 콧망울 구조 기반    \n*표현 - 00% - 성찰 *\n唇厚, 眼尾傾斜 차이 기반 \n*집중 - 00% - 인식*\n다크서클 색상 + 입 구조, 감정 내향성 등 분석\n*사고 - 00% - 직관*\n面幅高比, 鼻翼寬 비대칭 등에서 드러나는 자기 기준 해석\n \n\n**username의 강점**  \n한자 기반 관상 용어를 활용하여 2~3개의 성격적 강점을 나눠서 분류해서 설명하세요.  \n기계적인 수치 설명이 아니라, '이 수치가 인생에서 어떤 장점으로 작용하는지'를 감성적이면서 전문가답게 풀어주세요.\n\n**username의 약점**  \n마찬가지로 수치 기반으로 드러나는 단점이나 경계해야 할 심리적 특성을 2가지 정도 분류해서 자극적으로 정리해 설명해주세요.  \n예) '唇厚가 얇고, 눈 기울기 차이가 크다면 감정을 드러내지 않아 오해를 살 수 있다' 등\n\n\n\n\n**username의 관상 총평**  \n위 내용들을 모두 포함하여, 단호하고 강인한 말투로 조언하는 전문가의 말을 작성해주세요.\n---\n\n\n### 입력 예시:\n\n- username : 이진원\n- 얼굴 너비-높이 비율: 0.88  \n- 얼굴 대칭성: 86%  \n- 눈 기울기 좌/우: 6.9° / 4.1°  \n- 눈 사이 거리: 1.26  \n- 코 길이: 0.45  \n- 코 높이: 2.70  \n- 왼쪽 콧망울: 1.02  \n- 오른쪽 콧망울: 0.79  \n- 아랫입술 두께: 0.44  \n- 왼쪽 눈 색상: #333333  \n- 오른쪽 눈 색상: #2e2e2e  \n- 다크서클 색상: #6d6d6d  \n- 피부 색상: #d9cfc8\n\n→ 이 데이터를 기반으로 위 양식에 맞춰 작성해주세요."
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

      // 타임아웃 해제
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP 오류: ${response.status}`;
        
        // 모델 관련 오류 처리
        if (errorMessage.includes("model")) {
          console.error("모델 오류:", errorMessage);
          return {
            title: `분석 오류(${ErrorType.MODEL_NOT_FOUND})`,
            description: "요청한 AI 모델을 찾을 수 없습니다. 관리자에게 문의하세요."
          };
        }
        
        // 서버 오류 처리
        if (response.status >= 500) {
          console.error("서버 오류:", errorMessage);
          return {
            title: `분석 오류(${ErrorType.SERVER_ERROR})`,
            description: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          };
        }
        
        // 기타 API 오류
        console.error("API 오류:", errorMessage);
        return {
          title: `분석 오류(${ErrorType.API_REQUEST_FAILED})`,
          description: `API 요청 중 오류가 발생했습니다: ${errorMessage}`
        };
      }

      const responseData = await response.json();
      
      if (!responseData || !responseData.choices || !responseData.choices[0] || !responseData.choices[0].message || !responseData.choices[0].message.content) {
        console.error("API 응답이 비어있습니다");
        return {
          title: `분석 오류(${ErrorType.API_RESPONSE_EMPTY})`,
          description: "API로부터 응답을 받지 못했습니다. 다시 시도해주세요."
        };
      }

      // 응답 텍스트의 첫 번째 줄을 제목으로, 나머지를 설명으로 분리
      try {
        const resultText = responseData.choices[0].message.content;
        const lines = resultText.toString().split('\n');
        const title = lines[0].trim();
        const description = lines.slice(1).join('\n').trim();

        // 데이터 검증: 실제 결과가 있는지 확인
        if (!title || !description) {
          return {
            title: `분석 오류(${ErrorType.API_PARSING_ERROR})`,
            description: "API 응답이 유효한 형식이 아닙니다. 다시 시도해주세요."
          };
        }
        
        // username 값을 제목에 반영
        const formattedTitle = title.replace('username', data.userName || '진원');
        const formattedDescription = description.replace(/username/g, data.userName || '진원');

        return {
          title: formattedTitle,
          description: formattedDescription
        };
      } catch (parseError) {
        console.error("응답 파싱 오류:", parseError);
        return {
          title: `분석 오류(${ErrorType.API_PARSING_ERROR})`,
          description: "응답 데이터를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요."
        };
      }
    } catch (fetchError: any) {
      // 타임아웃 해제
      clearTimeout(timeoutId);
      
      // 취소된 요청 처리
      if (fetchError.name === 'AbortError') {
        console.error("API 요청 타임아웃");
        return {
          title: `분석 오류(${ErrorType.TIMEOUT_ERROR})`,
          description: "분석 시간이 초과되었습니다. 다시 시도해주세요."
        };
      }
      
      // 네트워크 오류 처리
      if (fetchError.message && (
        fetchError.message.includes("network") || 
        fetchError.message.includes("connection") ||
        fetchError.message.includes("fetch")
      )) {
        console.error("네트워크 오류:", fetchError);
        return {
          title: `분석 오류(${ErrorType.NETWORK_ERROR})`,
          description: "네트워크 연결 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요."
        };
      }
      
      console.error("API 요청 오류:", fetchError);
      return {
        title: `분석 오류(${ErrorType.API_REQUEST_FAILED})`,
        description: `API 요청 중 오류가 발생했습니다: ${fetchError.message || '알 수 없는 오류'}`
      };
    }
  } catch (error) {
    console.error("AI 결과 요청 오류:", error);
    return {
      title: `분석 오류(${ErrorType.UNKNOWN_ERROR})`,
      description: "죄송합니다. AI 분석 과정에서 오류가 발생했습니다. 다시 시도해주세요."
    };
  }
}; 