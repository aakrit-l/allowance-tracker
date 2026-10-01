export type ExpenseCategory = string;

export interface SectorItem {
  id: string;
  name: string;
  color: string;
  budgetRecommendation?: string;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
  vibe?: string;
  excuse?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag?: string;
  isCustom?: boolean;
}

export interface BudgetSummary {
  allowance: number;
  totalSpent: number;
  remaining: number;
  percentageSpent: number;
  status: 'safe' | 'caution' | 'warning' | 'exceeded';
  categoryTotals: Record<string, number>;
  categoryPercentages: Record<string, number>;
  topCategory: { category: string; amount: number; percentage: number } | null;
  daysInCurrentMonth: number;
  currentDayOfMonth: number;
  daysLeftInMonth: number;
  dailyAllowanceOriginal: number;
  dailyRemainingBudget: number;
  currentDailyBurnRate: number;
  projectedMonthEndSpent: number;
  willExhaustEarly: boolean;
  projectedExhaustionDay: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  provider?: 'claude' | 'gemini' | 'local';
}

export interface UserProfile {
  name: string;
  email: string;
  occupation: string;
  bio: string;
  targetSavingsGoalName: string;
  targetSavingsGoalAmount: number;
  currentSavingsTotal: number;
  targetTimeframeMonths: number;
  targetDeadlineDate?: string;
  joinDate: string;
}

export interface MonthlyRecord {
  id: string;
  monthKey: string; // YYYY-MM
  label: string; // e.g. "Apr 2026"
  allowance: number;
  totalSpent: number;
  remaining: number;
  topSector: string;
  sectorBreakdown?: Record<string, number>;
}
