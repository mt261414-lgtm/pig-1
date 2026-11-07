import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: 'pet' | 'cam' | 'report' | 'lab';
  setActiveTab: (tab: 'pet' | 'cam' | 'report' | 'lab') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onQuickRecord: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  onQuickRecord,
}) => {
  const toggleSound = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted) {
      sound.playClickPop();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            sound.playClickPop();
            setActiveTab('pet');
          }}
          className="text-lg font-bold tracking-tight text-emerald-800 flex items-center gap-2 whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-base">
            🌱
          </span>
          <span>에코다이어트</span>
        </button>

        {/* Zone 2: Concise Nav Links (4 items, single line, subtle underline/indicator) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              sound.playClickPop();
              setActiveTab('pet');
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'pet'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            에코 펫 육성
          </button>
          <button
            onClick={() => {
              sound.playClickPop();
              setActiveTab('cam');
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'cam'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            AI 식단 감지
          </button>
          <button
            onClick={() => {
              sound.playClickPop();
              setActiveTab('report');
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'report'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            주간 탄소 다이어트
          </button>
          <button
            onClick={() => {
              sound.playClickPop();
              setActiveTab('lab');
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'lab'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            가변 출처 토론실
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? '소리 켜기' : '소리 끄기'}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            aria-label={isMuted ? '효과음 켜기' : '효과음 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClickPop();
              onQuickRecord();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>오늘 식단 분석하기</span>
          </button>
        </div>
      </div>

      {/* Mobile nav sub-bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white py-2 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('pet')}
          className={`py-1 px-2 ${activeTab === 'pet' ? 'text-emerald-700 font-bold' : ''}`}
        >
          에코 펫
        </button>
        <button
          onClick={() => setActiveTab('cam')}
          className={`py-1 px-2 ${activeTab === 'cam' ? 'text-emerald-700 font-bold' : ''}`}
        >
          식단 분석
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`py-1 px-2 ${activeTab === 'report' ? 'text-emerald-700 font-bold' : ''}`}
        >
          주간 리포트
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`py-1 px-2 ${activeTab === 'lab' ? 'text-emerald-700 font-bold' : ''}`}
        >
          가변 출처
        </button>
      </div>
    </header>
  );
};
