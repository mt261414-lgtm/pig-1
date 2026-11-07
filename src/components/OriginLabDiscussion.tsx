import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  FlaskConical,
  Truck,
  Sprout,
  Package,
  Sparkles,
  MessageSquare,
  Send,
  HelpCircle,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface OriginLabDiscussionProps {
  onEarnExp: (exp: number) => void;
}

export const OriginLabDiscussion: React.FC<OriginLabDiscussionProps> = ({ onEarnExp }) => {
  // Simulator State
  const [baseFood, setBaseFood] = useState<'beef' | 'tofu' | 'chicken' | 'pork'>('beef');
  const [transport, setTransport] = useState<'local_direct' | 'domestic_standard' | 'imported_ship' | 'imported_air'>('imported_air');
  const [farming, setFarming] = useState<'organic_regenerative' | 'feedlot' | 'heated_greenhouse' | 'smart_renewable'>('feedlot');
  const [packaging, setPackaging] = useState<'zero_waste' | 'standard' | 'multi_plastic_ice'>('multi_plastic_ice');

  // Student discussion response state
  const [studentIdea, setStudentIdea] = useState<string>('');
  const [tutorFeedback, setTutorFeedback] = useState<{
    scoreText: string;
    analysis: string;
    followUpQuestion: string;
  } | null>(null);
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);

  // Baseline data per food
  const FOOD_META = {
    beef: { label: '소고기 스테이크', baseKg: 14.5, icon: '🥩' },
    tofu: { label: '신선 두부 요리', baseKg: 0.6, icon: '🥗' },
    chicken: { label: '닭고기 구이', baseKg: 2.8, icon: '🍗' },
    pork: { label: '돼지고기 제육', baseKg: 4.5, icon: '🍲' },
  };

  // Calculation multipliers
  const TRANSPORT_FACTORS = {
    local_direct: { factor: 0.85, label: '로컬 푸드 직매장 (50km 이내)', desc: '단거리 직송으로 유통 탄소 70% 절감' },
    domestic_standard: { factor: 1.0, label: '국내 표준 유통 (트럭 물류)', desc: '전국 농협/도매 물류망 기준' },
    imported_ship: { factor: 1.15, label: '해외 수입 (냉동 선박)', desc: '대량 컨테이너 운송으로 비교적 효율적' },
    imported_air: { factor: 1.65, label: '해외 수입 (신선 항공 특송)', desc: '비행기 고고도 운송으로 탄소 65% 급증' },
  };

  const FARMING_FACTORS = {
    organic_regenerative: { factor: 0.75, label: '재생 유기농업 / 자연 방목', desc: '화학 비료 배제 및 토양 탄소 격리' },
    smart_renewable: { factor: 0.8, label: '신재생에너지 스마트팜', desc: '태양광/지열 수직농장, 수자원 90% 절약' },
    feedlot: { factor: 1.0, label: '일반 관행 집약 농축산', desc: '표준 배합 사료 및 일반 농법' },
    heated_greenhouse: { factor: 1.45, label: '화석연료 난방 시설 온실', desc: '동절기 등유/석탄 온실 가동으로 에너지 다소비' },
  };

  const PACKAGING_FACTORS = {
    zero_waste: { factor: 0.92, label: '용기내 챌린지 / 다회용기', desc: '일회용 폐기물 제로 실천' },
    standard: { factor: 1.0, label: '일반 플라스틱 포장', desc: '표준 랩/트레이 진공 포장' },
    multi_plastic_ice: { factor: 1.12, label: '새벽배송 3중 보랭 스티로폼', desc: '스티로폼 박스 + 보냉제 + 에어캡' },
  };

  // Compute live simulated carbon
  const baseKg = FOOD_META[baseFood].baseKg;
  const tMult = TRANSPORT_FACTORS[transport].factor;
  const fMult = FARMING_FACTORS[farming].factor;
  const pMult = PACKAGING_FACTORS[packaging].factor;

  const currentSimulatedKg = Number((baseKg * tMult * fMult * pMult).toFixed(2));
  const diffPercent = Number((((currentSimulatedKg - baseKg) / baseKg) * 100).toFixed(1));

  // Handle student discussion submission
  const handleStudentSubmit = () => {
    if (!studentIdea.trim()) return;
    setIsSubmittingIdea(true);
    sound.playClickPop();

    setTimeout(() => {
      sound.playLowCarbonChime();
      setIsSubmittingIdea(false);
      onEarnExp(30);

      const ideaLower = studentIdea.toLowerCase();
      let analysis =
        '매우 훌륭한 통찰입니다! 제시해주신 아이디어는 AI가 사진 픽셀 데이터만으로는 알 수 없는 물리적 공급망(Supply Chain)의 비가시적 정보를 보완하는 핵심 전략입니다.';
      let followUp =
        '만약 소비자가 원산지 입력을 귀찮아할 경우, 사용자 참여율을 높이기 위해 어떤 게이미피케이션 인센티브(추가 경험치, 친환경 뱃지 등)를 부여할 수 있을까요?';

      if (ideaLower.includes('영수증') || ideaLower.includes('바코드') || ideaLower.includes('qr')) {
        analysis =
          '탁월한 공학적 접근입니다! 컴퓨터 비전(음식 사진 인식)과 OCR/바코드 스캐너를 융합하는 멀티모달 파이프라인(Multimodal Fusion)은 실제 푸드테크 업계에서도 가장 각광받는 실현 가능한 모델입니다.';
        followUp = '바코드 정보가 훼손되었거나 외식 식당에서 먹을 때는 어떤 보완책을 마련할 수 있을까요?';
      } else if (ideaLower.includes('api') || ideaLower.includes('정부') || ideaLower.includes('이력제') || ideaLower.includes('데이터')) {
        analysis =
          '공공 데이터베이스(축산물 이력제, GAP 인증 시스템) 연계는 신뢰성 있는 탄소 산출의 핵심입니다. AI 모델에 RAG(검색 증강 생성) 기법을 적용하여 실시간 국가 표준 배출계수를 동적 참조할 수 있습니다.';
        followUp = '해외에서 직수입된 재료의 경우 글로벌 데이터 표준(LCA DB)과 어떻게 연동하면 좋을까요?';
      }

      setTutorFeedback({
        scoreText: '💡 훌륭한 수업 토론 참여! (+30 EXP)',
        analysis,
        followUpQuestion: followUp,
      });
    }, 700);
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <FlaskConical className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">가변 출처 시뮬레이터 & 수업 논의 토론실</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-4xl">
          <strong className="text-slate-800">수업 논의 핵심 질문:</strong> "동일한 메뉴라도 재료의
          출처(원산지, 운송 수단, 농법, 포장)에 따라 탄소 배출량이 크게 다른데, AI 모델에 이러한 가변
          데이터를 어떻게 반영할 수 있을까?"
        </p>
      </div>

      {/* Part 1: Interactive Origin LCA Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🔬</span>
              <span>1. 출처 가변 데이터 실시간 시뮬레이터</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              동일 메뉴에서 출처 조건(운송/농법/포장)을 바꾸며 탄소 발자국이 어떻게 극적으로 변하는지
              확인하세요.
            </p>
          </div>

          {/* Menu Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
            {(['beef', 'tofu', 'chicken', 'pork'] as const).map((foodKey) => (
              <button
                key={foodKey}
                type="button"
                onClick={() => {
                  sound.playClickPop();
                  setBaseFood(foodKey);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  baseFood === foodKey
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{FOOD_META[foodKey].icon}</span>
                <span className="ml-1">{FOOD_META[foodKey].label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Parameter Selection Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Transport */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>운송 수단 및 유통 거리</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(TRANSPORT_FACTORS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    sound.playClickPop();
                    setTransport(key as any);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    transport === key
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{val.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        val.factor > 1.2
                          ? 'bg-rose-100 text-rose-800'
                          : val.factor < 1.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {val.factor}x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-normal">{val.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Farming Method */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>재배 및 사육 농법</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(FARMING_FACTORS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    sound.playClickPop();
                    setFarming(key as any);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    farming === key
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{val.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        val.factor > 1.2
                          ? 'bg-rose-100 text-rose-800'
                          : val.factor < 1.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {val.factor}x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-normal">{val.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Packaging */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>포장 및 배송 방식</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(PACKAGING_FACTORS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    sound.playClickPop();
                    setPackaging(key as any);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    packaging === key
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{val.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        val.factor > 1.05
                          ? 'bg-rose-100 text-rose-800'
                          : val.factor < 1.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {val.factor}x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-normal">{val.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Result Card */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">
              {FOOD_META[baseFood].label} 가변 출처 적용 시뮬레이션 결과
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-emerald-400 tabular-nums">
                {currentSimulatedKg}{' '}
                <span className="text-sm font-normal text-slate-300">kg CO2e</span>
              </span>
              <span className="text-xs text-slate-400">
                (기본 표준치: {baseKg} kg CO2e)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              출처 가변 요인 반영 결과, 기준치 대비{' '}
              <strong
                className={`font-bold ${diffPercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
              >
                {diffPercent > 0 ? `+${diffPercent}% 증가` : `${diffPercent}% 절감`}
              </strong>
              되었습니다.
            </p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-xs shrink-0 max-w-sm">
            <span className="font-semibold text-emerald-300 block mb-1">
              💡 시뮬레이션 핵심 발견점
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              동일한 요리라도 항공 운송이나 화석연료 난방 온실을 거치면 탄소 배출이 최대 2배 이상
              폭증할 수 있습니다. 이것이 AI가 단순 이미지만으로 탄소를 단정할 수 없는 결정적 이유입니다!
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Architectural AI Solutions for Variable Origin Data */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>⚙️</span>
            <span>2. AI 모델은 이러한 가변 데이터를 어떻게 반영할 수 있을까? (3대 공학 솔루션)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            수업에서 다룰 수 있는 컴퓨터 공학적 / 데이터 아키텍처적 3가지 핵심 솔루션입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Solution 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                A. 멀티모달 퓨전 (Multimodal Fusion)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                음식 사진(요리 인식) + 마트 장보기 영수증/식품 바코드 OCR을 동시 입력받아, 포장지에 적힌
                '국산/수입산', '친환경 유기농 마크'를 AI가 텍스트로 자동 추출해 계산 가중치에 융합합니다.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 mt-3 block">
              적용 기술: Gemini Multimodal Vision + OCR
            </span>
          </div>

          {/* Solution 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                B. RAG & 농식품 이력제 API 연계
              </h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                정부 공공데이터(농림축산식품부 축산물이력제, 농산물 GAP 데이터베이스)를 RAG(검색 증강
                생성)로 실시간 연결하여, 가축의 사육지 및 도축 유통 경로를 동적으로 조회합니다.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-indigo-700 mt-3 block">
              적용 기술: Live API Tool Calling + RAG
            </span>
          </div>

          {/* Solution 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                C. 대화형 Human-in-the-Loop 에이전트
              </h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                AI 모델이 사진 분석 후 출처 불확실성이 높다고 판단하면, 사용자에게 능동적으로 "이 소고기는
                한우인가요, 호주산인가요?"라고 질문을 던져 컨텍스트를 보정하는 능동형 인터랙션입니다.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 mt-3 block">
              적용 기술: Multi-turn Chat Agent
            </span>
          </div>
        </div>
      </div>

      {/* Part 3: Student Idea Submission & Interactive AI Tutor Feedback */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>3. 학습자 의견 작성 & AI 튜터 피드백 코너</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            "여러분이 AI 개발자라면, 음식 사진만으로 알 수 없는 원산지 가변 데이터를 어떻게 수집·반영하시겠습니까?"
          </p>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={studentIdea}
            onChange={(e) => setStudentIdea(e.target.value)}
            placeholder="예시: 식당 키오스크나 배달앱에서 주문할 때 식재료 원산지 정보가 자동으로 나의 에코다이어트로 연동되는 API를 만들면 사진을 찍지 않아도 정확한 탄소를 산출할 수 있을 것 같습니다."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-slate-50"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              💡 의견을 제출하면 AI 튜터의 실시간 평가와 함께 펫 경험치(+30 EXP)가 지급됩니다!
            </span>
            <button
              type="button"
              disabled={isSubmittingIdea || !studentIdea.trim()}
              onClick={handleStudentSubmit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingIdea ? '피드백 생성 중...' : '아이디어 제출 및 평가'}</span>
            </button>
          </div>
        </div>

        {/* AI Tutor Feedback Result */}
        {tutorFeedback && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2 text-emerald-950 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI 튜터의 분석 피드백</span>
              </span>
              <span className="font-bold text-emerald-700">{tutorFeedback.scoreText}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{tutorFeedback.analysis}</p>
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200/60 text-slate-800">
              <span className="font-bold text-emerald-900 block mb-0.5">심화 토론 질문:</span>
              <p className="text-slate-600">{tutorFeedback.followUpQuestion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
