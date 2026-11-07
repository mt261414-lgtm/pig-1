import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, Copy, Check, ExternalLink, Github, Terminal, Cloud, Key } from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    sound.playClickPop();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `git init
git branch -M main
git add .
git commit -m "feat: 에코다이어트 AI 탄소 식단 & 펫 육성 웹앱"
git remote add origin https://github.com/당신의계정/레포지토리이름.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClickPop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Cloud className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">GitHub &amp; Vercel 배포 가이드</h3>
            <p className="text-xs text-slate-500">
              Vite 프론트엔드와 Vercel Serverless Function(`/api`)이 모두 준비되어 있어 바로 배포할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 text-xs sm:text-sm">
          {/* Step 1: GitHub Push */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center">
                1
              </span>
              <Github className="w-4 h-4 text-slate-700" />
              <span>GitHub에 코드 푸시하기</span>
            </div>
            <p className="text-xs text-slate-600 pl-7">
              GitHub에서 새 레포지토리를 생성한 뒤, 로컬 터미널에서 다음 명령어를 실행하세요:
            </p>

            <div className="ml-7 bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs relative group">
              <pre className="overflow-x-auto whitespace-pre leading-relaxed">{gitCommands}</pre>
              <button
                type="button"
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>명령어 전체 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Vercel Import */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center">
                2
              </span>
              <Cloud className="w-4 h-4 text-slate-700" />
              <span>Vercel에서 프로젝트 가져오기 (Import)</span>
            </div>
            <div className="ml-7 space-y-1.5 text-xs text-slate-600">
              <p>1. <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5">Vercel 대시보드<ExternalLink className="w-3 h-3 ml-0.5" /></a>에 로그인합니다.</p>
              <p>2. <strong>Add New...</strong> ➔ <strong>Project</strong>를 클릭합니다.</p>
              <p>3. 방금 올린 GitHub 레포지토리를 찾아 <strong>Import</strong> 버튼을 누릅니다.</p>
              <p className="text-emerald-700 font-medium">※ `vercel.json`이 내장되어 있어 빌드 설정(Framework: Vite, Output: dist)은 자동 구성됩니다.</p>
            </div>
          </div>

          {/* Step 3: Environment Variables */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center">
                3
              </span>
              <Key className="w-4 h-4 text-slate-700" />
              <span>Gemini API 키 환경 변수 등록 (Environment Variables)</span>
            </div>
            <div className="ml-7 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p className="text-slate-700">
                Vercel 프로젝트 생성 화면의 <strong>Environment Variables</strong> 섹션에 아래 키를 추가합니다:
              </p>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 font-normal">NAME: </span>
                  <span className="font-bold text-slate-800">GEMINI_API_KEY</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('GEMINI_API_KEY', 2)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="변수명 복사"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-500 text-[11px]">
                💡 VALUE에는 Google AI Studio에서 발급받은 본인의 API Key를 입력하세요. (미입력 시에도 내장된 탄소 표준 벤치마크 엔진이 안전하게 작동합니다)
              </p>
            </div>
          </div>

          {/* Step 4: Deploy Completed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center">
                4
              </span>
              <span>배포 완료 및 자동 업데이트</span>
            </div>
            <p className="text-xs text-slate-600 pl-7">
              <strong>Deploy</strong> 버튼을 누르면 1분 내외로 무료 전 세계 CDN 호스팅 도메인이 발급됩니다! 이후 GitHub에 코드를 `git push`할 때마다 Vercel이 자동으로 새로 빌드하여 최신 상태를 유지합니다.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClickPop();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
