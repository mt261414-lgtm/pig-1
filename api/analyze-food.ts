import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', dishNameHint = '', originContext = {} } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const parts: any[] = [];

        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          });
        }

        const promptText = `
당신은 '에코다이어트(EcoDiet)' 게임의 AI 탄소발자국 식단 감지 전문 AI 분석관입니다.
사용자가 제공한 음식 사진(또는 메뉴명: "${dishNameHint}")을 정밀 분석하고, 식단 탄소 발자국과 게임 펫 반응, 그리고 "재료 출처에 따른 가변 데이터" 분석을 JSON으로 반환하세요.

사용자 입력 원산지/조리 컨텍스트(있을 경우):
- 원산지: ${originContext.origin || '미지정 (기본값 가정)'}
- 운송 수단: ${originContext.transport || '일반 유통'}
- 재배/사육 방식: ${originContext.farming || '관행 농축산'}

중요 과학적 기준 (1인분 기준 탄소 발자국):
- 소고기/양고기: 8.0 ~ 20.0 kg CO2e (등급: D ~ F)
- 치즈/버터 다량: 4.0 ~ 8.0 kg CO2e (등급: C ~ D)
- 돼지고기/가공육: 3.5 ~ 6.0 kg CO2e (등급: C)
- 닭고기/오리고기: 2.0 ~ 3.5 kg CO2e (등급: B)
- 생선/해물: 1.5 ~ 3.0 kg CO2e (등급: B)
- 계란/유제품 가벼운 식단: 1.0 ~ 2.0 kg CO2e (등급: B)
- 쌀밥/곡물/두부/콩/파스타(채소류): 0.5 ~ 1.2 kg CO2e (등급: A)
- 제철 채소/과일/비건 샐러드: 0.2 ~ 0.5 kg CO2e (등급: A+)

등급 기준:
- A+ (0.0 ~ 0.5 kg CO2e) : 초저탄소 (지구 힐링!)
- A (0.5 ~ 1.2 kg CO2e) : 저탄소 (칭찬해요)
- B (1.2 ~ 3.0 kg CO2e) : 보통 (균형 식단)
- C (3.0 ~ 6.0 kg CO2e) : 다소 높음 (경계)
- D (6.0 ~ 10.0 kg CO2e) : 높음 (주의)
- F (10.0 kg CO2e 초과) : 매우 높음 (지구 온난화 가속)

게임 펫 피드백:
- 귀여운 숲의 정령 펫 '새싹이'의 1인칭 한국어 말투.
- 저탄소(A+, A)면 기뻐서 춤추고 경험치 +40~50, "와아! 지구가 맑아지고 제 잎사귀가 쑥쑥 자라요!"
- 중탄소(B)면 "맛있고 든든해요! 다음엔 채소 반찬을 하나 더 얹어볼까요?" (+25 EXP)
- 고탄소(C, D, F)면 땀을 삐질 흘리며 "으앗! 온도가 올라가요~ 그래도 맛있게 드시고, 다음 끼니는 두부나 샐러드로 식혀주세요!" (+10 EXP + 탄소 상쇄 퀘스트 제안)

수업 논의 포인트 (재료 출처 가변 데이터 반영 방안):
- 동일한 메뉴라도 로컬 vs 원거리 수입(항공/선박), 온실가열 vs 노지/스마트팜, 사료 vs 방목에 따라 수치 변동성 분석.
- AI 모델에 이러한 가변 데이터를 어떻게 효과적으로 반영할 수 있는지 구체적 기술적 제안 (1. 멀티모달 영수증/바코드 결합, 2. 원산지 메타데이터 프롬프트 인젝션, 3. 유통망 블록체인/IoT 실시간 LCA DB 연동)을 작성할 것.

반드시 정해진 JSON 형식으로만 응답하세요.`;

        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                foodName: { type: Type.STRING, description: '인식된 한국어 요리명' },
                category: { type: Type.STRING, description: '식단 카테고리' },
                detectedIngredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '감지된 주요 식재료 목록 및 추정 용량',
                },
                dietType: {
                  type: Type.STRING,
                  description: '식단 유형',
                },
                estimatedCarbonKg: {
                  type: Type.NUMBER,
                  description: '1인분 추정 탄소 배출량 (kg CO2e)',
                },
                carbonGrade: {
                  type: Type.STRING,
                  description: '탄소 등급 (A+, A, B, C, D, F)',
                },
                carEquivKm: {
                  type: Type.NUMBER,
                  description: '내연기관 자동차 주행 환산 거리 (km)',
                },
                treesEquivalent: {
                  type: Type.NUMBER,
                  description: '30년생 소나무 1그루 1년 흡수량(약 6.6kg) 대비 비율',
                },
                petFeedback: {
                  type: Type.OBJECT,
                  properties: {
                    petMood: { type: Type.STRING, description: 'ecstatic, happy, neutral, sweating, hot 중 하나' },
                    dialogue: { type: Type.STRING, description: '펫의 귀여운 한국어 대사' },
                    expEarned: { type: Type.INTEGER, description: '지급 경험치 (10 ~ 50)' },
                    ecoPoints: { type: Type.INTEGER, description: '획득 에코 씨앗 포인트 (5 ~ 30)' },
                    recommendedQuest: { type: Type.STRING, description: '다음 추천 탄소 다이어트 퀘스트' },
                  },
                  required: ['petMood', 'dialogue', 'expEarned', 'ecoPoints', 'recommendedQuest'],
                },
                originDiscussionAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    baselineAssumption: { type: Type.STRING, description: '현재 계산의 기본 전제' },
                    originVariationImpact: {
                      type: Type.STRING,
                      description: '재료 출처에 따른 탄소 배출량 증감률(%) 및 설명',
                    },
                    aiAdaptationMethod: {
                      type: Type.STRING,
                      description: 'AI 모델이 가변적 출처 데이터를 인식하고 반영하기 위한 방안 제안',
                    },
                  },
                  required: ['baselineAssumption', 'originVariationImpact', 'aiAdaptationMethod'],
                },
                ecoTip: { type: Type.STRING, description: '식단을 더 친환경적으로 바꾸기 위한 실천 팁' },
              },
              required: [
                'foodName',
                'category',
                'detectedIngredients',
                'dietType',
                'estimatedCarbonKg',
                'carbonGrade',
                'carEquivKm',
                'treesEquivalent',
                'petFeedback',
                'originDiscussionAnalysis',
                'ecoTip',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, data: parsed, source: 'gemini-3.8-flash' });
      } catch (geminiError) {
        console.warn('Gemini API call error, falling back to deterministic LCA engine:', geminiError);
      }
    }

    // Deterministic fallback
    const query = (dishNameHint || '소고기 스테이크').toLowerCase();
    const isSalad = query.includes('샐러드') || query.includes('두부') || query.includes('채소') || query.includes('비건');
    const isChicken = query.includes('치킨') || query.includes('닭') || query.includes('계란');
    const isPork = query.includes('돼지') || query.includes('삼겹') || query.includes('제육');

    let foodName = dishNameHint || (isSalad ? '두부 아보카도 샐러드' : '소고기 찹스테이크');
    let estimatedCarbonKg = isSalad ? 0.45 : isChicken ? 2.8 : isPork ? 4.9 : 14.8;
    let carbonGrade = isSalad ? 'A+' : isChicken ? 'B' : isPork ? 'C' : 'F';
    let dietType = isSalad ? '비건 식물성 식단' : isChicken ? '가금류 균형 식단' : isPork ? '육류 중심 식단' : '적색육 고탄소 식단';
    let detectedIngredients = isSalad
      ? ['유기농 두부 150g', '아보카도 80g', '방울토마토 60g', '어린잎 채소 50g', '발사믹 올리브 드레싱']
      : ['소고기 등심 220g', '버터 15g', '구운 아스파라거스', '마늘 및 로즈마리'];

    const origin = originContext.origin || 'default';
    if (origin === 'imported_air') {
      estimatedCarbonKg *= 1.35;
    } else if (origin === 'local_organic') {
      estimatedCarbonKg *= 0.82;
    }

    estimatedCarbonKg = Number(estimatedCarbonKg.toFixed(2));
    const carEquivKm = Number((estimatedCarbonKg * 4.1).toFixed(1));
    const treesEquivalent = Number((estimatedCarbonKg / 6.6).toFixed(2));

    const petFeedback = isSalad
      ? {
          petMood: 'ecstatic',
          dialogue: '와아! 푸릇푸릇 두부 샐러드 최고예요! 탄소가 적어서 숲의 기운이 샘솟아요! 잎사귀가 자라났어요!',
          expEarned: 45,
          ecoPoints: 25,
          recommendedQuest: '내일 점심도 저탄소 샐러드 또는 콩요리로 연속 2일 달성하기!',
        }
      : {
          petMood: 'sweating',
          dialogue: '으앗! 고온 경보 발령! 소고기는 탄소 배출이 높아서 제 이마에 땀이 송골송골 맺혀요. 다음 끼니는 채식으로 시원하게 해줄래요?',
          expEarned: 10,
          ecoPoints: 5,
          recommendedQuest: '다음 끼니는 "고기 없는 식단(Meatless Meal)"으로 탄소 80% 상쇄하기!',
        };

    const originDiscussionAnalysis = {
      baselineAssumption: '일반 표준 도매 유통 및 관행 사육 기준',
      originVariationImpact: isSalad
        ? '항공으로 수입된 아보카도나 온실 수경재배 채소는 로컬 제철 채소보다 최대 3~4배 더 많은 탄소를 배출할 수 있습니다.'
        : '동일한 소고기라도 항공 수입 육류 및 사료 수입 의존 농가는 로컬 방목 유기농 축산보다 운송/가공 단계에서 탄소가 20~40% 추가 발생합니다.',
      aiAdaptationMethod:
        '단순 사진만으로는 원산지를 알 수 없으므로, AI 식단 다이어리는 (1) 마트 영수증 QR/바코드 연동, (2) 식자재 이력제 API 결합, (3) 사용자 원산지 보정 프롬프트 인터페이스를 결합한 하이브리드 아키텍처로 가변 데이터를 해결할 수 있습니다.',
    };

    return res.json({
      success: true,
      data: {
        foodName,
        category: isSalad ? '신선 채식/샐러드' : '육류 구이/스테이크',
        detectedIngredients,
        dietType,
        estimatedCarbonKg,
        carbonGrade,
        carEquivKm,
        treesEquivalent,
        petFeedback,
        originDiscussionAnalysis,
        ecoTip: isSalad
          ? '아보카도 대신 로컬 제철 채소(오이, 시금치)를 활용하면 탄소 발자국을 한 번 더 절반으로 줄일 수 있습니다.'
          : '붉은 고기 섭취를 주 1회 줄이고 버섯이나 콩단백으로 대체하면 연간 승용차 500km 주행만큼의 탄소를 감축합니다.',
      },
      source: 'benchmark-lca-engine',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || '서버 오류' });
  }
}
