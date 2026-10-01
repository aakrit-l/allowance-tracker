import React from 'react';
import { Sun, Moon, RotateCcw, Sparkles, SlidersHorizontal, BarChart3, Wallet, User } from 'lucide-react';
import { CurrencyConfig, UserProfile } from '../types';
import { cleanCurrencySymbol } from '../utils/formatCurrency';

interface HeaderProps {
  isDark: boolean;
  currency: CurrencyConfig;
  profile: UserProfile;
  activeSection: 'planner' | 'history' | 'profile';
  onSelectSection: (section: 'planner' | 'history' | 'profile') => void;
  toggleTheme: () => void;
  onReset: () => void;
  onLoadSample: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  currency,
  profile,
  activeSection,
  onSelectSection,
  toggleTheme,
  onReset,
  onLoadSample,
  onOpenSettings,
}) => {
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'AP';

  return (
    <header className="border-b border-[#e5e5dc] dark:border-[#2b2d24] bg-[#fbfbf9]/95 dark:bg-[#161713]/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Header Bar */}
        <div className="h-15 flex items-center justify-between gap-2">
          {/* Brand */}
          <div
            onClick={() => onSelectSection('planner')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#808000] text-white flex items-center justify-center shadow-xs font-semibold text-sm">
              AP
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                Allowance Planner
              </h1>
              <p className="text-[10px] text-stone-400 hidden sm:block">
                Budget & Expense Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-[#f0f0ea] dark:bg-[#20221a] p-1 rounded-lg border border-[#e2e2d8] dark:border-[#2d3026]">
            <button
              type="button"
              onClick={() => onSelectSection('planner')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'planner'
                  ? 'bg-white dark:bg-[#151612] text-[#808000] dark:text-[#c4c43b] shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Planner</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSection('history')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'history'
                  ? 'bg-white dark:bg-[#151612] text-[#808000] dark:text-[#c4c43b] shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Past Results</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSection('profile')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'profile'
                  ? 'bg-white dark:bg-[#151612] text-[#808000] dark:text-[#c4c43b] shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            {/* Sectors & Currency Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#22241d] dark:hover:bg-[#2c2e25] rounded-md border border-[#deded4] dark:border-[#35382c] transition-colors"
              title="Configure Expense Sectors & Currency"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#808000] dark:text-[#c4c43b]" />
              <span className="hidden md:inline">Sectors & Currency</span>
              <span className="font-mono font-bold text-[#808000] dark:text-[#c4c43b]">
                {cleanCurrencySymbol(currency)}
              </span>
            </button>

            <button
              onClick={onLoadSample}
              type="button"
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-[#808000] dark:hover:text-[#c4c43b] bg-stone-100 dark:bg-[#22241d] rounded-md transition-colors"
              title="Load sample demo data"
            >
              <Sparkles className="w-3 h-3 text-[#808000]" />
              <span>Sample</span>
            </button>

            <button
              onClick={onReset}
              type="button"
              title="Reset data"
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#22241d] rounded-md transition-colors"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#c4c43b]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-stone-600" />
              )}
            </button>

            {/* User Profile Avatar Quick Button */}
            <button
              type="button"
              onClick={() => onSelectSection('profile')}
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-transform ${
                activeSection === 'profile'
                  ? 'bg-[#808000] text-white ring-2 ring-offset-1 ring-[#808000]'
                  : 'bg-[#808000]/20 text-[#808000] dark:text-[#c4c43b] hover:scale-105'
              }`}
              title="View Profile"
            >
              {initials}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex sm:hidden border-t border-[#ecece4] dark:border-[#272920] py-1.5 gap-1 justify-around">
          <button
            type="button"
            onClick={() => onSelectSection('planner')}
            className={`flex-1 py-1 text-center text-xs font-medium rounded ${
              activeSection === 'planner'
                ? 'bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] font-semibold'
                : 'text-stone-500'
            }`}
          >
            Planner
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('history')}
            className={`flex-1 py-1 text-center text-xs font-medium rounded ${
              activeSection === 'history'
                ? 'bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] font-semibold'
                : 'text-stone-500'
            }`}
          >
            Past Results
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('profile')}
            className={`flex-1 py-1 text-center text-xs font-medium rounded ${
              activeSection === 'profile'
                ? 'bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] font-semibold'
                : 'text-stone-500'
            }`}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};
