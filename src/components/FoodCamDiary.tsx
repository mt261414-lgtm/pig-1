import React, { useState, useRef } from 'react';
import { FoodAnalysisResult, MealLogItem, PetState, CarbonGrade } from '../types';
import { sound } from '../utils/audio';
import {
  Camera,
  Upload,
  Sparkles,
  Car,
  Trees,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface FoodCamDiaryProps {
  pet: PetState;
  setPet: React.Dispatch<React.SetStateAction<PetState>>;
  mealLogs: MealLogItem[];
  setMealLogs: React.Dispatch<React.SetStateAction<MealLogItem[]>>;
  onGoToReport: () => void;
  onGoToLab: () => void;
}

export const FoodCamDiary: React.FC<FoodCamDiaryProps> = ({
  pet,
  setPet,
  mealLogs,
  setMealLogs,
  onGoToReport,
  onGoToLab,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    '/src/assets/images/food_tofu_salad_1794032583773.jpg'
  );
  const [dishNameInput, setDishNameInput] = useState<string>('신선 두부 아보카도 샐러드');
  const [mealType, setMealType] = useState<'아침' | '점심' | '저녁' | '간식'>('점심');
  const [originType, setOriginType] = useState<string>('local_organic');
  const [transportType, setTransportType] = useState<string>('local');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [hasLoggedCurrentMeal, setHasLoggedCurrentMeal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset sample foods
  const PRESET_MEALS = [
    {
      name: '신선 두부 아보카도 샐러드',
      type: '비건/채식 (A+ 등급)',
      image: '/src/assets/images/food_tofu_salad_1794032583773.jpg',
      origin: 'local_organic',
      transport: 'local',
    },
    {
      name: '소고기 안심 스테이크',
      type: '붉은 고기 (F 등급)',
      image: '/src/assets/images/food_beef_steak_1794032584009.jpg',
      origin: 'imported_air',
      transport: 'air',
    },
    {
      name: '매콤 제육볶음',
      type: '돼지고기 (C 등급)',
      image: '',
      origin: 'domestic',
      transport: 'truck',
    },
    {
      name: '바질 토마토 파스타',
      type: '곡물/채소 (A 등급)',
      image: '',
      origin: 'local',
      transport: 'local',
    },
    {
      name: '바삭 프라이드 치킨',
      type: '가금류 (B 등급)',
      image: '',
      origin: 'domestic',
      transport: 'truck',
    },
  ];

  // Handle image upload from user device / camera
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClickPop();
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setDishNameInput('');
      setAnalysisResult(null);
      setHasLoggedCurrentMeal(false);
    };
    reader.readAsDataURL(file);
  };

  // Run AI food recognition & carbon estimation
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setHasLoggedCurrentMeal(false);
    sound.playClickPop();

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage?.startsWith('data:') ? selectedImage : undefined,
          dishNameHint: dishNameInput || '음식 사진',
          originContext: {
            origin: originType,
            transport: transportType,
          },
        }),
      });

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || '음식 인식에 실패했습니다.');
      }

      const result: FoodAnalysisResult = resJson.data;
      setAnalysisResult(result);

      // Play audio feedback based on carbon grade
      if (result.carbonGrade === 'A+' || result.carbonGrade === 'A') {
        sound.playLowCarbonChime();
      } else if (result.carbonGrade === 'D' || result.carbonGrade === 'F') {
        sound.playHighCarbonTone();
      } else {
        sound.playClickPop();
      }
    } catch (err: any) {
      setErrorMessage(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Feed current analyzed meal to the pet and log into diary
  const handleLogMeal = () => {
    if (!analysisResult) return;
    sound.playClickPop();

    // 1. Add to meal logs
    const newLog: MealLogItem = {
      id: `meal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mealType,
      foodName: analysisResult.foodName,
      imageUrl: selectedImage || undefined,
      carbonKg: analysisResult.estimatedCarbonKg,
      carbonGrade: analysisResult.carbonGrade,
      dietType: analysisResult.dietType,
      expEarned: analysisResult.petFeedback.expEarned,
      originNote: `${originType === 'local_organic' ? '로컬 유기농' : originType === 'imported_air' ? '수입 항공' : '일반 유통'}`,
    };
    setMealLogs((prev) => [newLog, ...prev]);

    // 2. Update pet state
    setPet((prev) => {
      const addedExp = analysisResult.petFeedback.expEarned;
      const newExp = prev.currentExp + addedExp;
      let newLevel = prev.level;
      let maxExp = prev.maxExp;
      let newStage = prev.evolutionStage;

      if (newExp >= maxExp) {
        newLevel += 1;
        maxExp = Math.round(maxExp * 1.4);
        if (newLevel >= 3 && newStage === 1) newStage = 2;
        if (newLevel >= 6) newStage = 3;
        sound.playLevelUpFanfare();
      }

      // If meal is low carbon, cools earth temperature; if high, slightly warms
      let tempChange = -0.02;
      let carbonSaved = 0;
      if (analysisResult.carbonGrade === 'A+' || analysisResult.carbonGrade === 'A') {
        tempChange = -0.04;
        carbonSaved = 2.5; // saved vs average meat meal
      } else if (analysisResult.carbonGrade === 'F' || analysisResult.carbonGrade === 'D') {
        tempChange = +0.03;
      }

      return {
        ...prev,
        level: newLevel,
        currentExp: newExp % maxExp,
        maxExp,
        evolutionStage: newStage,
        ecoPoints: prev.ecoPoints + analysisResult.petFeedback.ecoPoints,
        totalCarbonSavedKg: Number((prev.totalCarbonSavedKg + carbonSaved).toFixed(1)),
        earthTempC: Number((prev.earthTempC + tempChange).toFixed(2)),
        lastDialogue: analysisResult.petFeedback.dialogue,
        currentMood: analysisResult.petFeedback.petMood,
        lastFedTimestamp: new Date().toISOString(),
      };
    });

    setHasLoggedCurrentMeal(true);
  };

  const getGradeStyle = (grade: CarbonGrade) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-600 text-white border-emerald-500';
      case 'A':
        return 'bg-emerald-500 text-white border-emerald-400';
      case 'B':
        return 'bg-teal-500 text-white border-teal-400';
      case 'C':
        return 'bg-amber-500 text-white border-amber-400';
      case 'D':
        return 'bg-orange-500 text-white border-orange-400';
      case 'F':
      default:
        return 'bg-rose-600 text-white border-rose-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📸</span>
            <span>AI 음식 사진 탄소 발자국 감지</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            식사 사진을 업로드하거나 촬영하면 Gemini AI가 식재료와 탄소 배출 등급(A+~F)을 즉시 산출합니다.
          </p>
        </div>

        {/* Meal Type Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {(['아침', '점심', '저녁', '간식'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                sound.playClickPop();
                setMealType(t);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mealType === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Input, Camera & Presets (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-5">
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700">원클릭 비교 샘플 식단</span>
              <span className="text-[11px] text-slate-400">클릭 시 자동 세팅</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MEALS.slice(0, 4).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    sound.playClickPop();
                    setSelectedImage(preset.image || null);
                    setDishNameInput(preset.name);
                    setOriginType(preset.origin);
                    setTransportType(preset.transport);
                    setAnalysisResult(null);
                    setHasLoggedCurrentMeal(false);
                  }}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    dishNameInput === preset.name
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <p className="truncate font-medium">{preset.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{preset.type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Frame / Upload Area */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 overflow-hidden relative cursor-pointer group flex flex-col items-center justify-center transition-colors"
            >
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="업로드된 음식 사진"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-xs font-semibold px-3 py-1.5 bg-black/60 rounded-lg flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>사진 변경 / 재촬영</span>
                    </span>
                  </div>

                  {/* AI Scanner radar overlay during analyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-xs flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-300 border-t-transparent animate-spin mb-3" />
                      <p className="text-white text-xs font-bold animate-pulse">
                        AI가 식재료 및 탄소 발자국 분석 중...
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">식사 사진을 촬영하거나 업로드하세요</p>
                  <p className="text-[11px] text-slate-400 mt-1">카메라 촬영 및 갤러리 이미지 지원</p>
                </div>
              )}
            </div>
          </div>

          {/* Dish Name Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              음식 이름 (사진과 함께 보조 입력)
            </label>
            <input
              type="text"
              value={dishNameInput}
              onChange={(e) => setDishNameInput(e.target.value)}
              placeholder="예: 소고기 스테이크, 두부 샐러드, 김치찌개"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Optional Origin / Transport Context (Link to classroom discussion) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700">식재료 출처 & 유통 방식 (가변 데이터)</span>
              <span className="text-[10px] text-emerald-700 font-medium">수업 연계</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={originType}
                onChange={(e) => setOriginType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="local_organic">로컬 / 유기농 재배</option>
                <option value="domestic">국내 일반 유통</option>
                <option value="imported_ship">해외 수입 (선박 운송)</option>
                <option value="imported_air">해외 수입 (항공 특송)</option>
              </select>

              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="local">근거리 직거래 (50km 이내)</option>
                <option value="truck">국내 트럭 물류망</option>
                <option value="air">초장거리 항공 직송</option>
              </select>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? '식단 정밀 분석 중...' : 'AI 탄소 발자국 감지하기'}</span>
          </button>

          {errorMessage && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Right Column: AI Analysis Result & Pet Feeding (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          {analysisResult ? (
            <div className="space-y-5">
              {/* Top Result Banner with Grade */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">{analysisResult.foodName}</h3>
                    <span className="text-xs text-slate-500 font-medium">({analysisResult.category})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{analysisResult.dietType}</p>
                </div>

                {/* Big Grade Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-2xl border-2 shadow-xs ${getGradeStyle(
                      analysisResult.carbonGrade
                    )}`}
                  >
                    <span>{analysisResult.carbonGrade}</span>
                    <span className="text-[9px] font-semibold tracking-tighter -mt-1 uppercase">
                      {analysisResult.carbonGrade === 'A+' || analysisResult.carbonGrade === 'A'
                        ? '저탄소'
                        : analysisResult.carbonGrade === 'B'
                        ? '보통'
                        : '고탄소'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block">1인분 탄소 배출량</span>
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {analysisResult.estimatedCarbonKg}{' '}
                      <span className="text-xs font-normal text-slate-500">kg CO2e</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Equivalence Visual Strips */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">내연기관 차 주행 환산</span>
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                      약 {analysisResult.carEquivKm} km
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">소나무 1년 흡수량 환산</span>
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                      약 {analysisResult.treesEquivalent} 그루분
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected Ingredients Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  감지된 주요 식재료 분해
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.detectedIngredients.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pet Speech Reaction */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  analysisResult.carbonGrade === 'A+' || analysisResult.carbonGrade === 'A'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : analysisResult.carbonGrade === 'D' || analysisResult.carbonGrade === 'F'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-sky-50/80 border-sky-200 text-sky-950'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-300 shrink-0">
                  <img
                    src="/src/assets/images/eco_sprout_pet_1794032583096.jpg"
                    alt="새싹이"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">새싹이의 반응</span>
                    <span className="text-xs font-bold tabular-nums">
                      +{analysisResult.petFeedback.expEarned} EXP · 🪙 +
                      {analysisResult.petFeedback.ecoPoints}P
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">
                    "{analysisResult.petFeedback.dialogue}"
                  </p>
                </div>
              </div>

              {/* Classroom Discussion Point Box */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>수업 논의 포인트: 재료 출처 가변 데이터</span>
                  </span>
                  <button
                    type="button"
                    onClick={onGoToLab}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>실험실에서 테스트</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed mb-2">
                  {analysisResult.originDiscussionAnalysis.originVariationImpact}
                </p>
                <p className="text-indigo-900/90 font-medium bg-white/80 p-2 rounded-lg border border-indigo-100/70">
                  💡 AI 모델 반영 방안: {analysisResult.originDiscussionAnalysis.aiAdaptationMethod}
                </p>
              </div>

              {/* Sustainable Recipe Swap Tip */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs flex items-start gap-2 text-slate-700">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">지구를 식히는 레시피 팁: </span>
                  <span>{analysisResult.ecoTip}</span>
                </div>
              </div>

              {/* Feed to Pet Button */}
              <div className="pt-2">
                {hasLoggedCurrentMeal ? (
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>새싹이에게 음식을 먹이고 다이어리에 성공적으로 기록했습니다!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogMeal}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🍽️ 새싹이에게 먹이고 탄소 다이어리에 기록하기 (+EXP)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty state placeholder */
            <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-700">음식 사진을 분석해 보세요</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
                좌측의 '원클릭 비교 샘플 식단'을 클릭하거나 직접 사진을 촬영하여 'AI 탄소 발자국
                감지하기' 버튼을 눌러보세요.
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span>소고기 vs 두부 샐러드 비교</span>
                <span>·</span>
                <span>탄소 등급 A+~F 산출</span>
                <span>·</span>
                <span>펫 성장 경험치 획득</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
