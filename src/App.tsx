import React, { useState, useEffect } from 'react';
import { PetState, MealLogItem } from './types';
import { loadPetState, savePetState, loadMealLogs, saveMealLogs } from './utils/storage';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { PetSanctuary } from './components/PetSanctuary';
import { FoodCamDiary } from './components/FoodCamDiary';
import { WeeklyReport } from './components/WeeklyReport';
import { OriginLabDiscussion } from './components/OriginLabDiscussion';
import { VercelDeployModal } from './components/VercelDeployModal';

export default function App() {
  const [pet, setPet] = useState<PetState>(loadPetState);
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>(loadMealLogs);
  const [activeTab, setActiveTab] = useState<'pet' | 'cam' | 'report' | 'lab'>('pet');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  // Sync state to local storage on changes
  useEffect(() => {
    savePetState(pet);
  }, [pet]);

  useEffect(() => {
    saveMealLogs(mealLogs);
  }, [mealLogs]);

  const handleEarnDiscussionExp = (expToAdd: number) => {
    setPet((prev) => {
      const newExp = prev.currentExp + expToAdd;
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

      return {
        ...prev,
        level: newLevel,
        currentExp: newExp % maxExp,
        maxExp,
        evolutionStage: newStage,
        ecoPoints: prev.ecoPoints + 15,
        lastDialogue: '수업 토론실에서 멋진 아이디어를 냈군요! 지식의 힘으로 지구가 더 건강해졌어요!',
        currentMood: 'ecstatic',
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1-Row 3-Zone Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onQuickRecord={() => setActiveTab('cam')}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'pet' && (
          <PetSanctuary
            pet={pet}
            setPet={setPet}
            onGoToCam={() => {
              sound.playClickPop();
              setActiveTab('cam');
            }}
            onGoToLab={() => {
              sound.playClickPop();
              setActiveTab('lab');
            }}
          />
        )}

        {activeTab === 'cam' && (
          <FoodCamDiary
            pet={pet}
            setPet={setPet}
            mealLogs={mealLogs}
            setMealLogs={setMealLogs}
            onGoToReport={() => {
              sound.playClickPop();
              setActiveTab('report');
            }}
            onGoToLab={() => {
              sound.playClickPop();
              setActiveTab('lab');
            }}
          />
        )}

        {activeTab === 'report' && (
          <WeeklyReport
            mealLogs={mealLogs}
            setMealLogs={setMealLogs}
            onGoToCam={() => {
              sound.playClickPop();
              setActiveTab('cam');
            }}
          />
        )}

        {activeTab === 'lab' && (
          <OriginLabDiscussion onEarnExp={handleEarnDiscussionExp} />
        )}
      </main>

      {/* Vercel & GitHub Deployment Guide Modal */}
      <VercelDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-800">에코다이어트 (EcoDiet)</span>
            <span>·</span>
            <span>AI 기반 식단 탄소 발자국 감지 &amp; 펫 육성 교육 플랫폼</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => {
                sound.playClickPop();
                setIsDeployModalOpen(true);
              }}
              className="text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
            >
              GitHub &amp; Vercel 배포 방법 안내
            </button>
            <span>·</span>
            <span>식품 LCA 기준: Our World in Data / Poore &amp; Nemecek (2018)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
