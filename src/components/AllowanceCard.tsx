import React, { useState, useEffect } from 'react';
import { CurrencyConfig } from '../types';
import { QUICK_ADD_AMOUNTS } from '../constants';
import { cleanCurrencySymbol } from '../utils/formatCurrency';
import { Plus, SlidersHorizontal } from 'lucide-react';

interface AllowanceCardProps {
  allowance: number;
  currency: CurrencyConfig;
  onUpdateAllowance: (amount: number) => void;
  onOpenSettings: () => void;
}

export const AllowanceCard: React.FC<AllowanceCardProps> = ({
  allowance,
  currency,
  onUpdateAllowance,
  onOpenSettings,
}) => {
  const [inputValue, setInputValue] = useState<string>(allowance > 0 ? allowance.toString() : '');
  const sym = cleanCurrencySymbol(currency);

  useEffect(() => {
    setInputValue(allowance > 0 ? allowance.toString() : '');
  }, [allowance]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val);
    const num = Number(val);
    onUpdateAllowance(isNaN(num) ? 0 : num);
  };

  const handleQuickAdd = (increment: number) => {
    const current = Number(inputValue) || 0;
    const updated = current + increment;
    setInputValue(updated.toString());
    onUpdateAllowance(updated);
  };

  const quickIncrements = QUICK_ADD_AMOUNTS[currency.code] || QUICK_ADD_AMOUNTS.NPR;

  return (
    <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Monthly Allowance
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Your planned budget ceiling
          </p>
        </div>

        {/* Currency Switcher & Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#f6f6f1] dark:bg-[#24261e] hover:bg-[#ecece4] dark:hover:bg-[#2d3027] text-stone-700 dark:text-stone-200 rounded-md border border-[#deded4] dark:border-[#35382c] transition-colors"
          title="Change currency or manage sectors"
        >
          <span className="text-stone-400 text-[11px]">Currency:</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono">
            {currency.code} ({sym})
          </span>
          <SlidersHorizontal className="w-3 h-3 text-[#808000] dark:text-[#c4c43b] ml-0.5" />
        </button>
      </div>

      {/* Main Input Field with Clean Integrated Prefix */}
      <div className="relative mb-3 flex items-center bg-[#fbfbf9] dark:bg-[#141511] border border-[#dcdcd1] dark:border-[#2d3027] rounded-lg focus-within:border-[#808000] focus-within:ring-2 focus-within:ring-[#808000]/20 transition-all overflow-hidden">
        <span className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 font-semibold text-sm sm:text-base select-none border-r border-[#ecece4] dark:border-[#282a20] bg-stone-100/60 dark:bg-[#1d1f18] flex items-center">
          {sym}
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="0"
          className="flex-1 px-3 py-2.5 bg-transparent text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-700 focus:outline-none"
        />
        <span className="pr-3 text-xs font-semibold text-stone-400 uppercase select-none">
          {currency.code}
        </span>
      </div>

      {/* Quick Add Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-stone-400 dark:text-stone-500 mr-1">Quick:</span>
        {quickIncrements.map((inc) => (
          <button
            key={inc}
            type="button"
            onClick={() => handleQuickAdd(inc)}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono font-medium text-stone-600 dark:text-stone-300 bg-[#f4f4ee] hover:bg-[#e9e9df] dark:bg-[#24261e] dark:hover:bg-[#2f3127] rounded transition-colors"
          >
            <Plus className="w-2.5 h-2.5 text-stone-400" />
            <span>{inc.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
