export type CarbonGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface PetFeedback {
  petMood: 'ecstatic' | 'happy' | 'neutral' | 'sweating' | 'hot';
  dialogue: string;
  expEarned: number;
  ecoPoints: number;
  recommendedQuest: string;
}

export interface OriginDiscussionAnalysis {
  baselineAssumption: string;
  originVariationImpact: string;
  aiAdaptationMethod: string;
}

export interface FoodAnalysisResult {
  foodName: string;
  category: string;
  detectedIngredients: string[];
  dietType: string;
  estimatedCarbonKg: number;
  carbonGrade: CarbonGrade;
  carEquivKm: number;
  treesEquivalent: number;
  petFeedback: PetFeedback;
  originDiscussionAnalysis: OriginDiscussionAnalysis;
  ecoTip: string;
}

export interface MealLogItem {
  id: string;
  timestamp: string; // ISO string
  mealType: '아침' | '점심' | '저녁' | '간식';
  foodName: string;
  imageUrl?: string;
  carbonKg: number;
  carbonGrade: CarbonGrade;
  dietType: string;
  expEarned: number;
  originNote?: string;
}

export interface PetState {
  name: string;
  level: number;
  currentExp: number;
  maxExp: number;
  evolutionStage: 1 | 2 | 3; // 1: 아기 새싹 정령, 2: 숲의 묘목 요정, 3: 지구 수호 가디언
  totalCarbonSavedKg: number;
  ecoPoints: number;
  earthTempC: number; // baseline 1.5 C goal (e.g. 1.2 ~ 2.0 C)
  treesPlanted: number;
  lastFedTimestamp: string;
  currentMood: 'ecstatic' | 'happy' | 'neutral' | 'sweating' | 'hot';
  lastDialogue: string;
}

export interface OriginSimulationConfig {
  baseFood: 'beef' | 'tofu' | 'chicken' | 'pork';
  origin: 'local_direct' | 'domestic_standard' | 'imported_ship' | 'imported_air';
  farming: 'organic_regenerative' | 'feedlot' | 'heated_greenhouse' | 'smart_renewable';
  packaging: 'zero_waste' | 'standard' | 'multi_plastic_ice';
}
