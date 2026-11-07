import React, { useState } from 'react';
import { PetState } from '../types';
import { sound } from '../utils/audio';
import { Sparkles, Heart, Droplets, ShieldCheck, Flame, ArrowRight, Award } from 'lucide-react';

interface PetSanctuaryProps {
  pet: PetState;
  setPet: React.Dispatch<React.SetStateAction<PetState>>;
  onGoToCam: () => void;
  onGoToLab: () => void;
}

export const PetSanctuary: React.FC<PetSanctuaryProps> = ({
  pet,
  setPet,
  onGoToCam,
  onGoToLab,
}) => {
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [isWatering, setIsWatering] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Trigger heart floating animation
  const handlePetInteraction = () => {
    sound.playClickPop();
    const newId = Date.now();
    setFloatingHearts((prev) => [...prev, { id: newId, x: Math.random() * 60 - 30 }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newId));
    }, 1200);

    const happyQuotes = [
      '간지러워요! 에코 에너지가 채워지는 느낌이에요~',
      '지구를 아끼는 친구의 손길은 언제나 따뜻해요!',
      '오늘도 맛있는 채식이나 저탄소 식사 한 끼 어때요?',
      '친구가 탄소를 줄여줄 때마다 제 잎사귀가 반짝여요!',
    ];
    const randomQuote = happyQuotes[Math.floor(Math.random() * happyQuotes.length)];

    setPet((prev) => ({
      ...prev,
      lastDialogue: randomQuote,
      currentMood: 'happy',
    }));

    showNotice('새싹이가 애정 표현에 행복해합니다! (+1 친밀도)');
  };

  // Water the pet with fresh rainwater
  const handleWaterPet = () => {
    sound.playLowCarbonChime();
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 900);

    setPet((prev) => {
      const addedExp = 5;
      const newExp = prev.currentExp + addedExp;
      let newLevel = prev.level;
      let newStage = prev.evolutionStage;
      let maxExp = prev.maxExp;

      if (newExp >= maxExp) {
        newLevel += 1;
        maxExp = Math.round(maxExp * 1.4);
        if (newLevel >= 3 && newStage === 1) {
          newStage = 2;
        }
        if (newLevel >= 6) {
          newStage = 3;
        }
        sound.playLevelUpFanfare();
        showNotice(`🎉 축하합니다! ${prev.name}가 Lv.${newLevel}로 성장했습니다!`);
      } else {
        showNotice('맑은 빗물을 마시고 새싹이가 상쾌해졌습니다! (+5 EXP)');
      }

      return {
        ...prev,
        level: newLevel,
        currentExp: newExp % maxExp,
        maxExp,
        evolutionStage: newStage,
        earthTempC: Math.max(1.35, Number((prev.earthTempC - 0.01).toFixed(2))),
        lastDialogue: '시원한 빗물 고마워요! 무럭무럭 자라서 지구 온난화를 막는 든든한 가디언이 될게요!',
        currentMood: 'ecstatic',
      };
    });
  };

  // Use eco points to cool down Earth temperature
  const handlePurifyAtmosphere = () => {
    if (pet.ecoPoints < 15) {
      showNotice('에코 씨앗 포인트가 부족합니다. (필요: 15P, 저탄소 식단 기록 시 획득)');
      return;
    }
    sound.playLowCarbonChime();
    setPet((prev) => ({
      ...prev,
      ecoPoints: prev.ecoPoints - 15,
      earthTempC: Math.max(1.3, Number((prev.earthTempC - 0.03).toFixed(2))),
      treesPlanted: prev.treesPlanted + 1,
      totalCarbonSavedKg: Number((prev.totalCarbonSavedKg + 6.6).toFixed(1)),
      lastDialogue: '숲의 정화 마법 발동! 지구 온도를 낮추고 소나무 1그루를 심었어요!',
      currentMood: 'ecstatic',
    }));
    showNotice('🌲 대기 정화 완료! 가상 소나무 1그루를 추가로 심었습니다!');
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3200);
  };

  // Choose character art based on evolution stage
  const petImageSrc =
    pet.evolutionStage >= 3
      ? '/src/assets/images/earth_guardian_pet_1794032584215.jpg'
      : '/src/assets/images/eco_sprout_pet_1794032583096.jpg';

  const stageTitles: Record<number, string> = {
    1: '1단계: 아기 새싹 정령',
    2: '2단계: 푸른 숲 요정',
    3: '3단계: 지구 수호 가디언',
  };

  const expPercentage = Math.min(100, Math.round((pet.currentExp / pet.maxExp) * 100));

  return (
    <div className="space-y-8">
      {/* Action toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 transition-all flex items-center gap-2">
          <span>✨</span>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Sanctuary Stage: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Pet Stage Arena (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
          {/* Subtle nature aura background */}
          <div className="absolute inset-0 bg-radial from-emerald-50/60 via-transparent to-transparent pointer-events-none" />

          {/* Top Status Strip */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">{pet.name}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Lv.{pet.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{stageTitles[pet.evolutionStage]}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">보유 에코 씨앗</span>
              <p className="text-sm font-bold text-emerald-700 tabular-nums">🪙 {pet.ecoPoints} P</p>
            </div>
          </div>

          {/* Center Pet Display with Animations */}
          <div className="py-6 flex flex-col items-center justify-center relative min-h-[340px]">
            {/* Floating Speech Bubble */}
            <div className="max-w-md w-full mb-4 px-4 py-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl relative shadow-xs">
              <div className="text-xs text-emerald-900 font-medium leading-relaxed flex items-start gap-2">
                <span className="text-base shrink-0">
                  {pet.currentMood === 'sweating' || pet.currentMood === 'hot'
                    ? '🥵'
                    : pet.currentMood === 'ecstatic'
                    ? '🥳'
                    : '🌱'}
                </span>
                <span>"{pet.lastDialogue}"</span>
              </div>
              {/* Bubble pointer triangle */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-emerald-200" />
            </div>

            {/* Interactive Pet Visual Canvas */}
            <div className="relative group cursor-pointer" onClick={handlePetInteraction}>
              {/* Glow circle behind */}
              <div
                className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                  pet.currentMood === 'sweating'
                    ? 'bg-amber-400/25 scale-110'
                    : 'bg-emerald-400/25 group-hover:bg-emerald-400/40 scale-105'
                }`}
              />

              {/* Pet Image Frame */}
              <div
                className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-2 shadow-md transition-transform duration-300 active:scale-95 ${
                  pet.currentMood === 'sweating'
                    ? 'border-amber-300 ring-4 ring-amber-100'
                    : 'border-emerald-200 ring-4 ring-emerald-50 animate-float'
                }`}
              >
                <img
                  src={petImageSrc}
                  alt="에코 펫 캐릭터"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Sweating mood overlay */}
                {(pet.currentMood === 'sweating' || pet.currentMood === 'hot') && (
                  <div className="absolute top-3 right-3 text-2xl animate-bounce">💦</div>
                )}

                {/* Watering droplet animation overlay */}
                {isWatering && (
                  <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-xs flex items-center justify-center">
                    <Droplets className="w-12 h-12 text-blue-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Floating hearts on click */}
              {floatingHearts.map((h) => (
                <div
                  key={h.id}
                  style={{ transform: `translateX(${h.x}px)` }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none text-rose-500 animate-ping text-xl"
                >
                  ❤️
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <span>💡 캐릭터를 탭하면 쓰다듬어 애정을 줄 수 있어요!</span>
            </p>
          </div>

          {/* Bottom EXP Bar & Controls */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* EXP Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>성장 경험치 (EXP)</span>
                <span className="tabular-nums">
                  {pet.currentExp} / {pet.maxExp} ({expPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Pet Action Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handlePetInteraction}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>쓰다듬기</span>
              </button>

              <button
                type="button"
                onClick={handleWaterPet}
                className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-xl border border-sky-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>물 주기 (+5)</span>
              </button>

              <button
                type="button"
                onClick={handlePurifyAtmosphere}
                title="15 에코 포인트로 소나무 1그루 식재 & 지구 온도 낮추기"
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>대기 정화 (15P)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Climate & Ecology HUD Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
          {/* Earth Thermometer Target Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${pet.earthTempC > 1.5 ? 'text-rose-500' : 'text-emerald-500'}`} />
                <span className="text-sm font-bold text-slate-800">지구 체온계 (기후 한계선)</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">목표: 1.5°C 이내</span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                +{pet.earthTempC.toFixed(2)}
                <span className="text-lg font-medium text-slate-600 ml-0.5">°C</span>
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  pet.earthTempC <= 1.45
                    ? 'bg-emerald-100 text-emerald-800'
                    : pet.earthTempC <= 1.55
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {pet.earthTempC <= 1.45 ? '안전 권역 (정화 중)' : pet.earthTempC <= 1.55 ? '주의 단계' : '위험 (고온 경보)'}
              </span>
            </div>

            {/* Scale Gauge Indicator */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative mb-2">
              {/* 1.5 C target marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                style={{ left: '50%' }}
                title="1.5 C 임계점"
              />
              <div
                className={`h-full transition-all duration-500 ${
                  pet.earthTempC > 1.5 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(10, ((pet.earthTempC - 1.0) / 1.0) * 100))}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              식단에서 붉은 고기를 줄이고 채식 비율을 높이면 새싹이가 차가운 빗물로 온도를 식혀줍니다!
            </p>
          </div>

          {/* Carbon Savings & Trees Metric Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-800">에코 다이어트 누적 성과</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-500">감축한 탄소 발자국</span>
                <p className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                  {pet.totalCarbonSavedKg} <span className="text-xs font-normal text-slate-600">kg CO2e</span>
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">승용차 약 {(pet.totalCarbonSavedKg * 4.1).toFixed(0)}km 절감</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-500">심은 가상 소나무</span>
                <p className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                  🌲 {pet.treesPlanted} <span className="text-xs font-normal text-slate-600">그루</span>
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">1그루당 연 6.6kg 흡수</span>
              </div>
            </div>
          </div>

          {/* Daily Quests Box */}
          <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">오늘의 탄소 다이어트 퀘스트</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium">진행 중</span>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start justify-between gap-2 bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800">
                <div>
                  <p className="font-semibold text-emerald-100">점심 또는 저녁: 고기 없는 한 끼 먹기</p>
                  <p className="text-emerald-400/80 text-[11px]">두부, 샐러드, 버섯 등 식물성 식단 기록</p>
                </div>
                <span className="shrink-0 text-emerald-300 font-semibold">+40 EXP</span>
              </li>
              <li className="flex items-start justify-between gap-2 bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800">
                <div>
                  <p className="font-semibold text-emerald-100">가변 출처 토론실 실험 1회 실행</p>
                  <p className="text-emerald-400/80 text-[11px]">원산지/운송수단에 따른 배출량 차이 체험</p>
                </div>
                <span className="shrink-0 text-emerald-300 font-semibold">+20 EXP</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onGoToCam}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>음식 사진 찍고 퀘스트 달성</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
