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
    // 환경변수 확인
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const model = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-mini';
    const systemPrompt = process.env.REACT_APP_OPENAI_SYSTEM_PROMPT;
    const useProxy = process.env.REACT_APP_USE_PROXY === 'true';
    const proxyUrl = process.env.REACT_APP_PROXY_URL || 'https://cors-anywhere.herokuapp.com/';
    
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

    // API URL 결정 (프록시 사용 여부에 따라)
    const apiUrl = useProxy 
      ? `${proxyUrl}https://api.openai.com/v1/chat/completions`
      : 'https://api.openai.com/v1/chat/completions';
    
    console.log('🌐 사용할 URL:', apiUrl);
    console.log('🔧 프록시 사용:', useProxy);

    // API 호출 (재시도 없이 1번만)
    console.log('🚀 API 요청 시작 (1회만):', new Date().toISOString());
    const requestStartTime = performance.now();
    
    const controller = new AbortController();
    // 타임아웃을 60초로 늘림 (OpenAI API 응답 시간 고려)
    const timeoutId = setTimeout(() => {
      console.log('⏰ 타임아웃 발생 (60초) - 요청 중단');
      controller.abort();
    }, 60000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          // 응답 수신 문제 해결을 위한 헤더 설정
          'Accept': 'application/json',
          'Accept-Encoding': 'identity', // gzip 압축 해제로 응답 수신 문제 해결
          'User-Agent': 'Mozilla/5.0 (compatible; FaceAnalysis/1.0)',
          // 프록시 사용 시 추가 헤더
          ...(useProxy && {
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': window.location.origin
          })
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
        signal: controller.signal,
        // 응답 수신을 위한 설정
        keepalive: false,
        mode: useProxy ? 'cors' : 'cors',
        credentials: 'omit',
        // 추가 네트워크 설정
        cache: 'no-cache',
        redirect: 'follow'
      });

      const responseTime = performance.now() - requestStartTime;
      console.log(`📡 응답 받음 (${responseTime.toFixed(0)}ms):`, response.status);

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ API 응답 오류:', response.status, response.statusText);
        
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

      // 응답 본문 크기 확인
      const contentLength = response.headers.get('content-length');
      console.log('📦 응답 크기:', contentLength ? `${contentLength} bytes` : '알 수 없음');

      // JSON 파싱 시간 측정
      const parseStartTime = performance.now();
      
      // 응답을 텍스트로 먼저 읽어서 문제 확인
      const responseText = await response.text();
      console.log('📄 응답 텍스트 길이:', responseText.length);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.log('📄 응답 내용 일부:', responseText.substring(0, 500));
        throw new Error('응답 데이터 파싱에 실패했습니다.');
      }
      
      const parseTime = performance.now() - parseStartTime;
      console.log(`🔄 JSON 파싱 완료 (${parseTime.toFixed(0)}ms)`);
      
      // 강제 가비지 컬렉션을 위한 참조 해제
      controller.abort(); // AbortController 정리
      
      const totalTime = performance.now() - requestStartTime;
      console.log(`✅ 전체 처리 완료 (${totalTime.toFixed(0)}ms)`);
      
      if (!result.choices || result.choices.length === 0) {
        console.error('❌ 응답에 choices가 없음:', result);
        throw new Error('분석 결과를 받지 못했습니다.');
      }

      console.log('🎯 응답 처리 시작');
      // 응답 처리
      const resultText = result.choices[0].message.content;
      if (!resultText) {
        console.error('❌ 응답 내용이 비어있음');
        throw new Error('분석 결과가 비어있습니다.');
      }

      const lines = resultText.toString().split('\n');
      const title = lines[0]?.trim() || '분석 완료';
      const description = lines.slice(1).join('\n').trim() || '분석이 완료되었습니다.';

      // 사용자명 치환
      const userName = data.userName || '사용자';
      const formattedTitle = title.replace(/username/g, userName);
      const formattedDescription = description.replace(/username/g, userName);

      // 메모리 정리를 위한 변수 해제 (const 변수는 재할당 불가하므로 제거)

      console.log('🏁 최종 결과 반환 완료');
      return {
        title: formattedTitle,
        description: formattedDescription
      };

    } catch (fetchError: any) {
      console.error(`💥 요청 실패:`, fetchError);
      console.error('💥 에러 타입:', fetchError.name);
      console.error('💥 에러 메시지:', fetchError.message);
      console.error('💥 에러 스택:', fetchError.stack);
      
      // 네트워크 상태 확인
      console.log('🌐 온라인 상태:', navigator.onLine);
      console.log('🌐 연결 타입:', (navigator as any).connection?.effectiveType || '알 수 없음');
      
      clearTimeout(timeoutId);
      controller.abort(); // 에러 시에도 AbortController 정리
      
      if (fetchError.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다.');
      } else if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        throw new Error('네트워크 연결을 확인해주세요. (CORS 또는 방화벽 차단 가능성)');
      } else if (fetchError.name === 'TypeError') {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      throw fetchError;
    }

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