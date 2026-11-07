import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Benchmark carbon emission database (kg CO2e per kg or serving, source: Poore & Nemecek / Our World in Data)
const FOOD_CARBON_BENCHMARKS: Record<string, { carbonKg: number; grade: string; tip: string }> = {
  '소고기': { carbonKg: 15.5, grade: 'F', tip: '소고기 1인분은 약 15.5kg CO2e를 배출합니다. 콩고기나 버섯으로 일부 대체하면 배출량을 최대 70% 줄일 수 있습니다.' },
  '돼지고기': { carbonKg: 4.8, grade: 'C', tip: '돼지고기는 소고기보다 탄소 배출이 적지만 채식에 비하면 여전히 4배 이상 높습니다.' },
  '닭고기': { carbonKg: 2.9, grade: 'B', tip: '가금류는 붉은 고기 대비 사료 효율이 높아 비교적 탄소 발자국이 낮습니다.' },
  '생선/해산물': { carbonKg: 2.5, grade: 'B', tip: '어획 방식 및 양식 사료에 따라 다르나 평균적으로 양호한 수준입니다.' },
  '두부': { carbonKg: 0.6, grade: 'A+', tip: '식물성 고단백 두부는 소고기 대비 약 96%의 탄소를 절감합니다.' },
  '채소 샐러드': { carbonKg: 0.4, grade: 'A+', tip: '신선한 제철 채소는 최고의 저탄소 식단입니다.' },
  '콩/견과류': { carbonKg: 0.3, grade: 'A+', tip: '대기 중 질소를 고정하는 콩류는 탄소 발자국이 극히 낮습니다.' },
  '파스타/면류': { carbonKg: 1.1, grade: 'B', tip: '고기 토핑 대신 바질 페스토나 버섯을 곁들이면 훨씬 친환경적입니다.' },
};

// API endpoint to analyze food image or text
app.post('/api/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', dishNameHint = '', originContext = {} } = req.body;

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

    if (hasApiKey) {
      try {
        const parts: any[] = [];

        if (imageBase64) {
          // Clean base64 string
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
                category: { type: Type.STRING, description: '식단 카테고리 (예: 한식 구이류, 샐러드류 등)' },
                detectedIngredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '감지된 주요 식재료 목록 및 추정 용량',
                },
                dietType: {
                  type: Type.STRING,
                  description: '식단 유형 (예: 육류 중심, 해산물 식단, 페스코, 락토오보, 비건 채식)',
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
                  description: '30년생 소나무 1그루 1년 흡수량(약 6.6kg) 대비 비율 또는 절감 효과',
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
                    baselineAssumption: { type: Type.STRING, description: '현재 계산의 기본 전제 (원산지/유통)' },
                    originVariationImpact: {
                      type: Type.STRING,
                      description: '재료 출처(로컬 vs 항공수입 vs 사료/재배방식)에 따른 탄소 배출량 증감률(%) 및 설명',
                    },
                    aiAdaptationMethod: {
                      type: Type.STRING,
                      description: 'AI 모델이 가변적 출처 데이터를 인식하고 반영하기 위한 아키텍처/해결책 제안 (수업 토론용)',
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
        console.warn('Gemini API call failed, falling back to deterministic benchmark engine:', geminiError);
      }
    }

    // High quality deterministic fallback calculation if no key or transient error
    const query = (dishNameHint || '소고기 스테이크').toLowerCase();
    const isSalad = query.includes('샐러드') || query.includes('두부') || query.includes('채소') || query.includes('비건');
    const isChicken = query.includes('치킨') || query.includes('닭') || query.includes('계란');
    const isPork = query.includes('돼지') || query.includes('삼겹') || query.includes('제육');
    const isBeef = query.includes('소고기') || query.includes('스테이크') || query.includes('갈비') || query.includes('한우') || (!isSalad && !isChicken && !isPork);

    let foodName = dishNameHint || (isSalad ? '두부 아보카도 샐러드' : '소고기 찹스테이크');
    let estimatedCarbonKg = isSalad ? 0.45 : isChicken ? 2.8 : isPork ? 4.9 : 14.8;
    let carbonGrade = isSalad ? 'A+' : isChicken ? 'B' : isPork ? 'C' : 'F';
    let dietType = isSalad ? '비건 식물성 식단' : isChicken ? '가금류 균형 식단' : isPork ? '육류 중심 식단' : '적색육 고탄소 식단';
    let detectedIngredients = isSalad
      ? ['유기농 두부 150g', '아보카도 80g', '방울토마토 60g', '어린잎 채소 50g', '발사믹 올리브 드레싱']
      : ['소고기 등심 220g', '버터 15g', '구운 아스파라거스', '마늘 및 로즈마리'];

    const origin = originContext.origin || 'default';
    if (origin === 'air_imported') {
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
  } catch (error: any) {
    console.error('Server analyze error:', error);
    return res.status(500).json({ success: false, error: error.message || '분석 중 오류가 발생했습니다.' });
  }
});

// Classroom simulation calculator endpoint: compare same dish with variable origin & production factors
app.post('/api/simulate-origin', (req, res) => {
  try {
    const { baseFood = 'beef', origin = 'imported_air', farming = 'feedlot', packaging = 'plastic' } = req.body;

    // Baseline calculation table (kg CO2e)
    let baseKg = baseFood === 'beef' ? 14.5 : baseFood === 'tofu' ? 0.6 : baseFood === 'chicken' ? 2.8 : 4.5;

    // Origin transport factor
    let transportFactor = 1.0;
    let transportDesc = '국내 일반 육상 운송 (트럭 150km)';
    if (origin === 'local_direct') {
      transportFactor = 0.85;
      transportDesc = '반경 50km 이내 로컬 푸드 직매장 (운송 탄소 70% 절감)';
    } else if (origin === 'imported_ship') {
      transportFactor = 1.15;
      transportDesc = '해외 선박 냉동 운송 (대량 수송으로 항공 대비 효율적)';
    } else if (origin === 'imported_air') {
      transportFactor = 1.65;
      transportDesc = '해외 신선 항공 특송 (초고탄소 운송, 탄소 65% 급증)';
    }

    // Farming method factor
    let farmingFactor = 1.0;
    let farmingDesc = '일반 관행 집약 농축산';
    if (farming === 'organic_regenerative') {
      farmingFactor = 0.75;
      farmingDesc = '재생 유기농업 / 자연 방목 (토양 탄소 격리 보너스)';
    } else if (farming === 'heated_greenhouse') {
      farmingFactor = 1.45;
      farmingDesc = '화석연료 난방 시설 온실 재배 (동절기 에너지 소비 극대화)';
    } else if (farming === 'smart_renewable') {
      farmingFactor = 0.8;
      farmingDesc = '신재생에너지 스마트팜 (수자원 90% 절약, LED 고효율)';
    }

    // Packaging factor
    let packFactor = 1.0;
    let packDesc = '일반 플라스틱 진공 포장';
    if (packaging === 'zero_waste') {
      packFactor = 0.92;
      packDesc = '다회용기 용기내 챌린지 / 생분해 포장재';
    } else if (packaging === 'multi_plastic_ice') {
      packFactor = 1.12;
      packDesc = '새벽배송 3중 보랭 스티로폼 + 아이스팩 포장';
    }

    const finalCarbonKg = Number((baseKg * transportFactor * farmingFactor * packFactor).toFixed(2));
    const baselineStandardKg = baseKg;
    const differencePercent = Number((((finalCarbonKg - baselineStandardKg) / baselineStandardKg) * 100).toFixed(1));

    return res.json({
      success: true,
      data: {
        baseFood,
        finalCarbonKg,
        baselineStandardKg,
        differencePercent,
        factors: {
          transport: { factor: transportFactor, desc: transportDesc },
          farming: { factor: farmingFactor, desc: farmingDesc },
          packaging: { factor: packFactor, desc: packDesc },
        },
        educationalTakeaway: `동일한 ${baseFood === 'beef' ? '소고기' : baseFood === 'tofu' ? '두부' : '식사'}라도 유통 및 생산 방식에 따라 탄소 배출량이 기준치 대비 ${differencePercent > 0 ? '+' + differencePercent : differencePercent}% 차이가 납니다.`,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// In development, hook up Vite middleware; in production, serve built static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
