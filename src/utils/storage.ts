import { CurrencyConfig, Expense, MonthlyRecord, SectorItem, UserProfile } from '../types';
import { CURRENCIES, DEFAULT_ALLOWANCE, DEFAULT_CURRENCY_CODE, DEFAULT_SECTORS } from '../constants';
import { getSampleExpenses } from './sampleData';
import { DEFAULT_USER_PROFILE, INITIAL_MONTHLY_HISTORY } from './historyData';

const STORAGE_KEYS = {
  ALLOWANCE: 'allowance_planner_amount',
  CURRENCY: 'allowance_planner_currency',
  EXPENSES: 'allowance_planner_expenses',
  SECTORS: 'allowance_planner_sectors',
  THEME: 'allowance_planner_theme',
  PROFILE: 'allowance_planner_user_profile',
  HISTORY: 'allowance_planner_monthly_history',
};

export function loadSavedAllowance(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ALLOWANCE);
    if (saved !== null) {
      const num = Number(saved);
      return isNaN(num) ? DEFAULT_ALLOWANCE : num;
    }
  } catch (e) {
    console.error('Error reading allowance from localStorage:', e);
  }
  return DEFAULT_ALLOWANCE;
}

export function saveAllowance(amount: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALLOWANCE, amount.toString());
  } catch (e) {
    console.error('Error saving allowance to localStorage:', e);
  }
}

export function loadSavedCurrency(): CurrencyConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.code && parsed.symbol) {
        if (parsed.symbol === '₨') {
          parsed.symbol = 'Rs.';
          saveCurrency(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading currency from localStorage:', e);
  }
  return CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY_CODE) || CURRENCIES[0];
}

export function saveCurrency(currency: CurrencyConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  } catch (e) {
    console.error('Error saving currency to localStorage:', e);
  }
}

export function loadSavedSectors(): SectorItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SECTORS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading sectors from localStorage:', e);
  }
  return DEFAULT_SECTORS;
}

export function saveSectors(sectors: SectorItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(sectors));
  } catch (e) {
    console.error('Error saving sectors to localStorage:', e);
  }
}

export function loadSavedExpenses(): Expense[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading expenses from localStorage:', e);
  }
  return getSampleExpenses();
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage:', e);
  }
}

export function loadSavedProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading profile from localStorage:', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to localStorage:', e);
  }
}

export function loadSavedHistory(): MonthlyRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading history from localStorage:', e);
  }
  return INITIAL_MONTHLY_HISTORY;
}

export function saveHistory(history: MonthlyRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history to localStorage:', e);
  }
}

export function loadSavedTheme(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) {
      return saved === 'dark';
    }
  } catch (e) {
    console.error('Error reading theme from localStorage:', e);
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function saveTheme(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  } catch (e) {
    console.error('Error saving theme to localStorage:', e);
  }
}

export function clearAllPlannerData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ALLOWANCE);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
}
