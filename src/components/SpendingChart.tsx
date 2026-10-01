import React, { useState } from 'react';
import { BudgetSummary, CurrencyConfig, SectorItem } from '../types';
import { cleanCurrencySymbol, formatMoney } from '../utils/formatCurrency';

interface SpendingChartProps {
  summary: BudgetSummary;
  currency: CurrencyConfig;
  sectors: SectorItem[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  summary,
  currency,
  sectors,
  selectedCategory,
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const { totalSpent, categoryTotals, categoryPercentages } = summary;
  const sym = cleanCurrencySymbol(currency);

  const getSectorColor = (catName: string): string => {
    const found = sectors.find((s) => s.name.toLowerCase() === catName.toLowerCase());
    return found ? found.color : '#808000';
  };

  const activeCategories = Object.keys(categoryTotals)
    .filter((cat) => (categoryTotals[cat] || 0) > 0)
    .sort((a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0));

  if (totalSpent === 0 || activeCategories.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors flex flex-col items-center justify-center min-h-[310px] text-center">
        <div className="w-10 h-10 rounded-full bg-[#f4f4ed] dark:bg-[#25271f] flex items-center justify-center text-[#808000] mb-2 font-mono text-xs">
          0%
        </div>
        <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300">
          No Spending Logged
        </h3>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-[200px]">
          Add an expense below to see your sector breakdown chart.
        </p>
      </div>
    );
  }

  // SVG dimensions
  const radius = 68;
  const strokeWidth = 24;
  const center = 85;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const arcs = activeCategories.map((cat) => {
    const amount = categoryTotals[cat] || 0;
    const percentage = categoryPercentages[cat] || 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
    cumulativeAngle += percentage;

    return {
      cat,
      amount,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      color: getSectorColor(cat),
    };
  });

  const activeCategoryFocus = hoveredCategory || selectedCategory;
  const activeFocusData = activeCategoryFocus
    ? {
        name: activeCategoryFocus,
        amount: categoryTotals[activeCategoryFocus] || 0,
        percentage: categoryPercentages[activeCategoryFocus] || 0,
        color: getSectorColor(activeCategoryFocus),
      }
    : null;

  return (
    <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Spending by Sector
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Distribution across your active sectors
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            type="button"
            className="text-[11px] text-[#808000] dark:text-[#c4c43b] hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Doughnut SVG */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 170 170">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-[#f4f4ee] dark:text-[#25271f]"
              strokeWidth={strokeWidth}
            />
            {arcs.map((arc) => {
              const isHighlighted =
                !activeCategoryFocus || activeCategoryFocus === arc.cat;
              return (
                <circle
                  key={arc.cat}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={arc.color}
                  strokeWidth={activeCategoryFocus === arc.cat ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  className={`transition-all duration-200 cursor-pointer ${
                    isHighlighted ? 'opacity-100' : 'opacity-25'
                  }`}
                  onMouseEnter={() => setHoveredCategory(arc.cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() =>
                    onSelectCategory(selectedCategory === arc.cat ? null : arc.cat)
                  }
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {activeFocusData ? (
              <>
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider truncate max-w-[100px]"
                  style={{ color: activeFocusData.color }}
                >
                  {activeFocusData.name}
                </span>
                <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 leading-tight">
                  {formatMoney(activeFocusData.amount, currency)}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {activeFocusData.percentage.toFixed(0)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 leading-tight">
                  {formatMoney(totalSpent, currency)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category list */}
        <div className="w-full flex-1 space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {activeCategories.map((cat) => {
            const amount = categoryTotals[cat] || 0;
            const pct = categoryPercentages[cat] || 0;
            const isSelected = selectedCategory === cat;
            const color = getSectorColor(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#808000]/10 text-stone-900 dark:text-stone-100 font-medium'
                    : 'hover:bg-stone-50 dark:hover:bg-[#25271f] text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate max-w-[110px]">{cat}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {formatMoney(amount, currency)}
                  </span>
                  <span className="text-stone-400 text-[11px] w-8 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
