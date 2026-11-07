import { MealLogItem, PetState } from '../types';

const STORAGE_KEYS = {
  PET_STATE: 'ecodiet_pet_state_v1',
  MEAL_LOGS: 'ecodiet_meal_logs_v1',
};

// Initial state for pet: adorable sprout
export const INITIAL_PET_STATE: PetState = {
  name: '새싹이',
  level: 1,
  currentExp: 45,
  maxExp: 100,
  evolutionStage: 1,
  totalCarbonSavedKg: 8.4,
  ecoPoints: 65,
  earthTempC: 1.48, // aiming to stay below 1.5 C!
  treesPlanted: 1,
  lastFedTimestamp: new Date().toISOString(),
  currentMood: 'happy',
  lastDialogue: '안녕! 나는 지구를 지키는 아기 새싹 정령 새싹이야. 오늘 먹을 음식을 나에게 보여줘!',
};

// Seed 5 historical meals from the current week to show rich weekly trends immediately
export const INITIAL_MEAL_LOGS: MealLogItem[] = [
  {
    id: 'seed-1',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    mealType: '점심',
    foodName: '두부 버섯 솥밥 & 된장국',
    carbonKg: 0.65,
    carbonGrade: 'A',
    dietType: '식물성 고단백 식단',
    expEarned: 40,
    originNote: '로컬 두부 및 표고버섯',
  },
  {
    id: 'seed-2',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    mealType: '저녁',
    foodName: '소고기 채끝 스테이크',
    carbonKg: 14.2,
    carbonGrade: 'F',
    dietType: '적색육 중심 고탄소 식단',
    expEarned: 10,
    originNote: '수입산 비육우 스테이크',
  },
  {
    id: 'seed-3',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    mealType: '점심',
    foodName: '아보카도 토마토 샐러드볼',
    carbonKg: 0.5,
    carbonGrade: 'A+',
    dietType: '비건 신선 채식',
    expEarned: 45,
    originNote: '유기농 어린잎 채소',
  },
  {
    id: 'seed-4',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    mealType: '저녁',
    foodName: '닭가슴살 단호박 오븐구이',
    carbonKg: 2.6,
    carbonGrade: 'B',
    dietType: '가금류 균형 식단',
    expEarned: 25,
    originNote: '국내산 닭가슴살',
  },
  {
    id: 'seed-5',
    timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    mealType: '아침',
    foodName: '오트밀 사과 그릭요거트',
    carbonKg: 0.9,
    carbonGrade: 'A',
    dietType: '락토 채식',
    expEarned: 35,
    originNote: '국내산 오트밀 및 제철 사과',
  },
];

export function loadPetState(): PetState {
  if (typeof window === 'undefined') return INITIAL_PET_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PET_STATE);
    if (!raw) {
      savePetState(INITIAL_PET_STATE);
      return INITIAL_PET_STATE;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PET_STATE;
  }
}

export function savePetState(state: PetState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PET_STATE, JSON.stringify(state));
  } catch (e) {}
}

export function loadMealLogs(): MealLogItem[] {
  if (typeof window === 'undefined') return INITIAL_MEAL_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    if (!raw) {
      saveMealLogs(INITIAL_MEAL_LOGS);
      return INITIAL_MEAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MEAL_LOGS;
  }
}

export function saveMealLogs(logs: MealLogItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(logs));
  } catch (e) {}
}
