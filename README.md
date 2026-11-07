# 에코다이어트 (EcoDiet): AI 식단 탄소 발자국 감지 & 에코 펫 육성

음식 사진 AI 인식으로 탄소 발자국을 감지하고, 식단 관리를 통해 나만의 에코 펫을 육성하는 친환경 게임형 다이어리 플랫폼입니다.

---

## 🚀 GitHub & Vercel 배포 가이드 (Step-by-Step)

본 프로젝트는 **Vercel 원클릭 배포**에 완벽히 최적화되어 있습니다.
(Vite React 프론트엔드 + Vercel Serverless Function `/api/*` 완벽 지원)

### 1단계: GitHub에 코드 올리기

로컬 터미널에서 다음 명령어를 순서대로 실행합니다:

```bash
# 1. 깃 초기화 및 브랜치 설정
git init
git branch -M main

# 2. 파일 추가 및 커밋
git add .
git commit -m "feat: 에코다이어트 AI 탄소 식단 & 펫 육성 웹앱 초기 커밋"

# 3. 깃허브 원격 저장소 연결 (본인의 GitHub 레포지토리 URL 입력)
git remote add origin https://github.com/사용자이름/레포지토리이름.git

# 4. 푸시
git push -u origin main
```

---

### 2단계: Vercel에서 배포하기

1. **[Vercel 대시보드](https://vercel.com/dashboard)** 접속 후 로그인합니다.
2. 우측 상단의 **`Add New...`** -> **`Project`**를 클릭합니다.
3. 1단계에서 코드를 올린 **GitHub 레포지토리를 선택하고 `Import`**를 누릅니다.
4. **Project Settings**:
   - Framework Preset: **`Vite`** (자동 감지됨)
   - Build Command: `vite build` (기본값)
   - Output Directory: `dist` (기본값)
5. **Environment Variables (환경 변수 등록 - 중요!)**:
   - `GEMINI_API_KEY`: Google AI Studio에서 발급받은 Gemini API 키 입력
     *(만약 API 키를 입력하지 않아도 내장된 오프라인 표준 LCA 벤치마크 엔진이 자동 작동하여 앱이 정상 작동합니다)*
6. **`Deploy`** 버튼을 클릭하면 약 1분 이내에 전 세계 배포 URL이 완성됩니다! 🎉

---

## 🛠️ 기술 스택 및 구조

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend / API**: Vercel Serverless Functions (`/api/analyze-food.ts`, `/api/simulate-origin.ts`) & Express
- **AI Model**: Google Gemini 3.8 Flash (`@google/genai` Multimodal Vision)
- **Audio Engine**: Web Audio API Sound Synthesizer (무설치 네이티브 합성음)
- **Storage**: 브라우저 LocalStorage 기반 자동 동기화

---

## 🌿 주요 기능

1. **🎮 에코 펫 육성 룸**:
   - 저탄소 식단 섭취 시 펫 성장 및 레벨업 (Lv.1 아기 새싹 ➔ Lv.2 숲의 요정 ➔ Lv.3 지구 수호 가디언)
   - 지구 체온계 (1.5°C 목표 관리), 쓰다듬기 및 빗물 주기 인터랙션
2. **📸 AI 음식 탄소 발자국 감지**:
   - 음식 사진 업로드 / 카메라 촬영으로 요리명 및 식재료 자동 인식
   - 탄소 배출 등급(A+ ~ F) 및 승용차 주행 환산 거리 산출
   - 소고기(15.5kg) vs 두부 샐러드(0.45kg) 극적 차이 체험
3. **📊 주간 탄소 다이어트 리포트**:
   - 최근 7일간 일일 탄소 배출 막대 차트
   - 채식/저탄소 vs 육류 식단 비율 분석
   - 감축한 탄소량 및 소나무 연간 흡수량 환산
4. **🔬 가변 출처 데이터 실험실 (수업 논의 포인트)**:
   - 동일 메뉴라도 원산지(로컬 vs 항공수입), 농법(스마트팜 vs 난방온실), 포장재에 따른 배출량 실시간 시뮬레이션
   - AI 모델 반영 3대 공학 솔루션 및 학생 의견 제출 & AI 튜터 피드백
