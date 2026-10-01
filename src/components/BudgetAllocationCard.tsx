import React from 'react';
import { BudgetSummary, CurrencyConfig, SectorItem } from '../types';
import { cleanCurrencySymbol, formatMoney } from '../utils/formatCurrency';
import { Percent } from 'lucide-react';

interface BudgetAllocationCardProps {
  summary: BudgetSummary;
  currency: CurrencyConfig;
  sectors: SectorItem[];
  allowance: number;
}

export const BudgetAllocationCard: React.FC<BudgetAllocationCardProps> = ({
  summary,
  currency,
  sectors,
  allowance,
}) => {
  const sym = cleanCurrencySymbol(currency);

  const needsTarget = allowance * 0.5;
  const wantsTarget = allowance * 0.3;
  const savingsTarget = allowance * 0.2;

  // Compute actual allocations
  let actualNeeds = 0;
  let actualWants = 0;
  let actualSavings = 0;

  Object.entries(summary.categoryTotals).forEach(([cat, amt]) => {
    const lower = cat.toLowerCase();
    if (lower.includes('saving')) {
      actualSavings += amt;
    } else if (lower.includes('food') || lower.includes('transport') || lower.includes('study') || lower.includes('rent') || lower.includes('health')) {
      actualNeeds += amt;
    } else {
      actualWants += amt;
    }
  });

  const needsPct = allowance > 0 ? (actualNeeds / allowance) * 100 : 0;
  const wantsPct = allowance > 0 ? (actualWants / allowance) * 100 : 0;
  const savingsPct = allowance > 0 ? (actualSavings / allowance) * 100 : 0;

  return (
    <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              50 / 30 / 20 Budget Health
            </h2>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] font-medium">
              Golden Ratio
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Target breakdown for {formatMoney(allowance, currency)} {currency.code}
          </p>
        </div>

        <div className="w-7 h-7 rounded-md bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] flex items-center justify-center">
          <Percent className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="space-y-3 text-xs">
        {/* Needs (50%) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-stone-800 dark:text-stone-200">
              Needs (50% target)
            </span>
            <span className="font-mono text-stone-500">
              {formatMoney(actualNeeds, currency)} / {formatMoney(needsTarget, currency)} ({needsPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 w-full bg-[#ebebe3] dark:bg-[#272920] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                needsPct > 55 ? 'bg-amber-500' : 'bg-[#808000]'
              }`}
              style={{ width: `${Math.min(100, needsPct)}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400">
            Covers essentials (Food, Transport, Study, Healthcare).
          </p>
        </div>

        {/* Wants (30%) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-stone-800 dark:text-stone-200">
              Wants (30% target)
            </span>
            <span className="font-mono text-stone-500">
              {formatMoney(actualWants, currency)} / {formatMoney(wantsTarget, currency)} ({wantsPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 w-full bg-[#ebebe3] dark:bg-[#272920] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                wantsPct > 35 ? 'bg-rose-500' : 'bg-[#526e57]'
              }`}
              style={{ width: `${Math.min(100, wantsPct)}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400">
            Covers entertainment, dining out, games & non-essentials.
          </p>
        </div>

        {/* Savings (20%) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-stone-800 dark:text-stone-200">
              Savings (20% target)
            </span>
            <span className="font-mono text-[#808000] dark:text-[#c4c43b] font-semibold">
              {formatMoney(actualSavings, currency)} / {formatMoney(savingsTarget, currency)} ({savingsPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 w-full bg-[#ebebe3] dark:bg-[#272920] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3b7a57] transition-all duration-500"
              style={{ width: `${Math.min(100, savingsPct)}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400">
            Recommended monthly deposit: {formatMoney(savingsTarget, currency)} for goals & emergencies.
          </p>
        </div>
      </div>
    </div>
  );
};
