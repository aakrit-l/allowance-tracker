import React from 'react';
import { BudgetSummary, CurrencyConfig } from '../types';
import { formatMoney } from '../utils/formatCurrency';

interface LiveSummaryCardProps {
  summary: BudgetSummary;
  currency: CurrencyConfig;
}

export const LiveSummaryCard: React.FC<LiveSummaryCardProps> = ({
  summary,
  currency,
}) => {
  const {
    allowance,
    totalSpent,
    remaining,
    percentageSpent,
    status,
    daysLeftInMonth,
    dailyRemainingBudget,
  } = summary;

  // Progress bar logic: yellow at 75% spent and red at 90%
  let progressColor = 'bg-[#808000]';
  let statusText = 'On Track';
  let statusBadgeStyle = 'text-[#808000] dark:text-[#c4c43b] bg-[#808000]/10 dark:bg-[#808000]/20';

  if (status === 'exceeded') {
    progressColor = 'bg-rose-600';
    statusText = 'Exceeded';
    statusBadgeStyle = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40';
  } else if (percentageSpent >= 90) {
    progressColor = 'bg-rose-600';
    statusText = 'Warning: 90%+';
    statusBadgeStyle = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40';
  } else if (percentageSpent >= 75) {
    progressColor = 'bg-amber-500';
    statusText = 'Caution: 75%+';
    statusBadgeStyle = 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40';
  }

  const barWidth = Math.min(100, Math.max(0, percentageSpent));

  return (
    <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Live Summary
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Spending pace and remaining runway
          </p>
        </div>

        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadgeStyle}`}>
          {statusText}
        </span>
      </div>

      {/* 3 Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        {/* Allowance */}
        <div className="p-3 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ebebe3] dark:border-[#26281f]">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block uppercase tracking-wider">
            Allowance
          </span>
          <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 block mt-0.5">
            {formatMoney(allowance, currency)}
          </span>
        </div>

        {/* Total Spent */}
        <div className="p-3 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ebebe3] dark:border-[#26281f]">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block uppercase tracking-wider">
            Total Spent
          </span>
          <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
            {formatMoney(totalSpent, currency)}
          </span>
        </div>

        {/* Remaining Balance */}
        <div className="p-3 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ebebe3] dark:border-[#26281f]">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block uppercase tracking-wider">
            Remaining
          </span>
          <span className={`text-xl font-bold font-mono block mt-0.5 ${
            remaining < 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-[#808000] dark:text-[#c4c43b]'
          }`}>
            {remaining < 0 ? `-${formatMoney(Math.abs(remaining), currency)}` : formatMoney(remaining, currency)}
          </span>
        </div>
      </div>

      {/* Progress Bar (Yellow at 75%, Red at 90%) */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500 dark:text-stone-400">Budget Spent</span>
          <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
            {percentageSpent.toFixed(1)}%
          </span>
        </div>

        <div className="h-2 w-full bg-[#ebebe3] dark:bg-[#272920] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500">
          <span>0%</span>
          <span className="text-amber-600 dark:text-amber-400">75% Caution</span>
          <span className="text-rose-600 dark:text-rose-400">90% Warning</span>
          <span>100%</span>
        </div>
      </div>

      {/* Daily Safe Pace */}
      <div className="pt-2.5 border-t border-[#ebebe3] dark:border-[#26281f] flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>{daysLeftInMonth} days remaining in month</span>
        <span>
          Daily target:{' '}
          <strong className="font-mono text-stone-900 dark:text-stone-100">
            {formatMoney(Math.max(0, dailyRemainingBudget), currency)}/day
          </strong>
        </span>
      </div>
    </div>
  );
};
