import React, { useMemo } from 'react';
import { MealLogItem, CarbonGrade } from '../types';
import { sound } from '../utils/audio';
import {
  TrendingDown,
  Car,
  Trees,
  Award,
  Sparkles,
  Calendar,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface WeeklyReportProps {
  mealLogs: MealLogItem[];
  setMealLogs: React.Dispatch<React.SetStateAction<MealLogItem[]>>;
  onGoToCam: () => void;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  mealLogs,
  setMealLogs,
  onGoToCam,
}) => {
  // Weekly calculations
  const stats = useMemo(() => {
    const totalCarbon = mealLogs.reduce((sum, item) => sum + item.carbonKg, 0);
    const avgCarbonPerMeal = mealLogs.length > 0 ? totalCarbon / mealLogs.length : 0;

    // Count vegetarian / low-carbon meals (A+, A) vs Meat/high carbon (C, D, F)
    const lowCarbonMeals = mealLogs.filter(
      (m) => m.carbonGrade === 'A+' || m.carbonGrade === 'A'
    ).length;
    const meatMeals = mealLogs.filter(
      (m) => m.carbonGrade === 'C' || m.carbonGrade === 'D' || m.carbonGrade === 'F'
    ).length;

    const plantBasedRatio =
      mealLogs.length > 0 ? Math.round((lowCarbonMeals / mealLogs.length) * 100) : 0;

    // Benchmark comparison: Average Korean adult diet emits ~4.8 kg CO2e per meal (~14.4 kg/day)
    const benchmarkEmissions = mealLogs.length * 4.2;
    const totalSavedKg = Math.max(0, Number((benchmarkEmissions - totalCarbon).toFixed(1)));
    const carKmEquivalent = Number((totalSavedKg * 4.1).toFixed(1));
    const treesEquivalent = Number((totalSavedKg / 6.6).toFixed(1));

    // Daily breakdown for the last 7 days
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dailyMap: Record<string, { label: string; carbon: number; count: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const dayLabel = `${dayNames[d.getDay()]} (${d.getMonth() + 1}/${d.getDate()})`;
      dailyMap[key] = { label: dayLabel, carbon: 0, count: 0 };
    }

    mealLogs.forEach((log) => {
      const key = log.timestamp.split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].carbon += log.carbonKg;
        dailyMap[key].count += 1;
      }
    });

    const dailyBars = Object.values(dailyMap).map((item) => ({
      ...item,
      carbon: Number(item.carbon.toFixed(2)),
    }));

    // Weekly Diet Title Evaluation
    let weeklyTitle = '새싹 에코 비기너';
    let weeklySummary = '균형 잡힌 식단으로 탄소를 줄여가고 있습니다.';
    if (plantBasedRatio >= 70) {
      weeklyTitle = '지구를 식히는 숲의 수호자 (Master Eco)';
      weeklySummary = '채식 위주의 고효율 저탄소 식단으로 온실가스를 대폭 감축했습니다!';
    } else if (plantBasedRatio >= 40) {
      weeklyTitle = '스마트 탄소 다이어터 (Eco Diet Champ)';
      weeklySummary = '육류 섭취를 적절히 조절하며 지속 가능한 식습관을 실천 중입니다.';
    } else {
      weeklyTitle = '육류 경보 주의 단계 (Meat Alert)';
      weeklySummary = '붉은 고기 비중이 높습니다. 주 2회 채식 데이를 실천해 보세요!';
    }

    return {
      totalCarbon: Number(totalCarbon.toFixed(1)),
      avgCarbonPerMeal: Number(avgCarbonPerMeal.toFixed(1)),
      plantBasedRatio,
      lowCarbonMeals,
      meatMeals,
      totalSavedKg,
      carKmEquivalent,
      treesEquivalent,
      dailyBars,
      weeklyTitle,
      weeklySummary,
    };
  }, [mealLogs]);

  // Remove a log entry
  const handleDeleteLog = (id: string) => {
    sound.playClickPop();
    setMealLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const getGradeBadge = (grade: CarbonGrade) => {
    const map: Record<CarbonGrade, { bg: string; text: string }> = {
      'A+': { bg: 'bg-emerald-100 text-emerald-800', text: 'A+ (초저탄소)' },
      A: { bg: 'bg-emerald-50 text-emerald-700', text: 'A (저탄소)' },
      B: { bg: 'bg-teal-50 text-teal-700', text: 'B (보통)' },
      C: { bg: 'bg-amber-100 text-amber-800', text: 'C (경계)' },
      D: { bg: 'bg-orange-100 text-orange-800', text: 'D (높음)' },
      F: { bg: 'bg-rose-100 text-rose-800', text: 'F (고탄소)' },
    };
    const c = map[grade] || map['F'];
    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${c.bg}`}>
        {c.text}
      </span>
    );
  };

  const maxDailyCarbon = Math.max(12, ...stats.dailyBars.map((d) => d.carbon));

  return (
    <div className="space-y-8">
      {/* Title strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📊</span>
            <span>주간 '탄소 다이어트' 종합 리포트</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            지난 7일간 기록된 식단의 탄소 배출량을 종합 분석하고, 일반 식단 대비 감축 효과를
            시각화합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClickPop();
            onGoToCam();
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>오늘 끼니 추가하기</span>
        </button>
      </div>

      {/* Weekly Title & Core Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weekly Title Card */}
        <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-2">
              <Award className="w-4 h-4" />
              <span>이번 주 탄소 다이어트 칭호</span>
            </div>
            <h3 className="text-lg font-bold text-white">{stats.weeklyTitle}</h3>
            <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
              {stats.weeklySummary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/80 flex justify-between text-xs">
            <span className="text-emerald-300">식물성 식단 비중</span>
            <span className="font-bold text-white tabular-nums">{stats.plantBasedRatio}%</span>
          </div>
        </div>

        {/* Carbon Savings Equivalent Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">전국 평균 대비 감축량</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <span className="text-3xl font-extrabold text-emerald-600 tabular-nums">
              -{stats.totalSavedKg}{' '}
              <span className="text-sm font-semibold text-slate-500">kg CO2e</span>
            </span>
            <p className="text-xs text-slate-500 mt-1">
              일반인 평균 식단(1끼 4.2kg) 대비 획기적으로 탄소를 줄였습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums">자동차 {stats.carKmEquivalent}km</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              <span className="tabular-nums">소나무 {stats.treesEquivalent}그루분</span>
            </div>
          </div>
        </div>

        {/* Diet Ratio Comparison Card (Problem statement focus) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">식단 유형별 비율</span>
            <span className="text-[11px] text-slate-400">총 {mealLogs.length}끼 기록</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-emerald-700">채식/저탄소 ({stats.lowCarbonMeals}회)</span>
              <span className="text-rose-700">육류/고탄소 ({stats.meatMeals}회)</span>
            </div>

            {/* Split bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.plantBasedRatio}%` }}
                title={`저탄소: ${stats.plantBasedRatio}%`}
              />
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${100 - stats.plantBasedRatio}%` }}
                title={`고탄소: ${100 - stats.plantBasedRatio}%`}
              />
            </div>

            <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 leading-normal">
              💡 <span className="font-semibold text-slate-800">핵심 사실:</span> 소고기 1끼(약 15kg)는
              두부 샐러드 30끼 분량의 탄소를 배출합니다!
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            주 3회만 육류를 채식으로 대체해도 연 0.5톤 감축 가능
          </div>
        </div>
      </div>

      {/* Visual Daily Carbon Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>최근 7일간 일일 탄소 배출 추이</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              1일 권장 저탄소 목표선: 3.5 kg CO2e 이하 (초록색 범위)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              <span>저탄소 유지</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              <span>권장 초과</span>
            </span>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="h-48 pt-6 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-2">
          {stats.dailyBars.map((bar, idx) => {
            const heightPercent = Math.min(100, Math.round((bar.carbon / maxDailyCarbon) * 100));
            const isExceeded = bar.carbon > 4.5;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 tabular-nums">
                  {bar.carbon} kg ({bar.count}끼)
                </div>

                {/* Number indicator */}
                <span className="text-[10px] font-bold text-slate-500 mb-1 tabular-nums">
                  {bar.carbon > 0 ? bar.carbon : '-'}
                </span>

                {/* Animated bar */}
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md h-32 flex items-end overflow-hidden">
                  <div
                    className={`w-full transition-all duration-700 rounded-t-md ${
                      isExceeded ? 'bg-rose-500' : bar.carbon > 0 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day label */}
                <span className="text-xs text-slate-600 font-medium mt-2 text-center whitespace-nowrap">
                  {bar.label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Diary History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">식단 다이어리 상세 기록</h3>
            <p className="text-xs text-slate-500 mt-0.5">총 {mealLogs.length}건의 식단 분석 이력</p>
          </div>
        </div>

        {mealLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {mealLogs.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
                      🍽️
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.mealType}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.foodName}</h4>
                      {getGradeBadge(item.carbonGrade)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.dietType} · {item.originNote || '일반 유통'} ·{' '}
                      {new Date(item.timestamp).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">배출량</span>
                    <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                      {item.carbonKg} <span className="text-xs font-normal text-slate-500">kg CO2e</span>
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 tabular-nums bg-emerald-50 px-2 py-1 rounded-md">
                    +{item.expEarned} EXP
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteLog(item.id)}
                    title="기록 삭제"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <p className="text-xs font-medium">아직 기록된 식단이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
