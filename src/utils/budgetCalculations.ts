import { BudgetSummary, Expense, SectorItem } from '../types';

export function calculateBudgetSummary(
  allowance: number,
  expenses: Expense[],
  sectors?: SectorItem[]
): BudgetSummary {
  const safeAllowance = Math.max(0, Number(allowance) || 0);

  // Initialize totals for all known sectors
  const categoryTotals: Record<string, number> = {};
  if (sectors && sectors.length > 0) {
    sectors.forEach((s) => {
      categoryTotals[s.name] = 0;
    });
  }

  // Aggregate expenses
  expenses.forEach((curr) => {
    const amt = Number(curr.amount) || 0;
    const cat = curr.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const remaining = safeAllowance - totalSpent;
  const percentageSpent = safeAllowance > 0 ? (totalSpent / safeAllowance) * 100 : (totalSpent > 0 ? 100 : 0);

  let status: 'safe' | 'caution' | 'warning' | 'exceeded' = 'safe';
  if (totalSpent > safeAllowance && safeAllowance > 0) {
    status = 'exceeded';
  } else if (percentageSpent >= 90) {
    status = 'warning';
  } else if (percentageSpent >= 75) {
    status = 'caution';
  }

  const categoryPercentages: Record<string, number> = {};
  let maxCategory = '';
  let maxAmount = -1;

  for (const [cat, amt] of Object.entries(categoryTotals)) {
    categoryPercentages[cat] = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
    if (amt > maxAmount && amt > 0) {
      maxAmount = amt;
      maxCategory = cat;
    }
  }

  const topCategory =
    totalSpent > 0 && maxAmount > 0
      ? {
          category: maxCategory,
          amount: maxAmount,
          percentage: (maxAmount / totalSpent) * 100,
        }
      : null;

  // Calendar calculations
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const currentDayOfMonth = now.getDate();
  const daysLeftInMonth = Math.max(1, daysInCurrentMonth - currentDayOfMonth);

  const dailyAllowanceOriginal = safeAllowance > 0 ? safeAllowance / daysInCurrentMonth : 0;
  const dailyRemainingBudget = remaining > 0 ? remaining / daysLeftInMonth : 0;
  const currentDailyBurnRate = currentDayOfMonth > 0 ? totalSpent / currentDayOfMonth : totalSpent;

  // Projected month-end spend
  const projectedMonthEndSpent = currentDailyBurnRate * daysInCurrentMonth;
  const willExhaustEarly = safeAllowance > 0 && projectedMonthEndSpent > safeAllowance && remaining > 0;

  let projectedExhaustionDay: number | null = null;
  if (currentDailyBurnRate > 0 && safeAllowance > 0 && totalSpent < safeAllowance) {
    const daysUntilExhaust = remaining / currentDailyBurnRate;
    const estDay = Math.floor(currentDayOfMonth + daysUntilExhaust);
    if (estDay <= daysInCurrentMonth) {
      projectedExhaustionDay = estDay;
    }
  }

  return {
    allowance: safeAllowance,
    totalSpent,
    remaining,
    percentageSpent,
    status,
    categoryTotals,
    categoryPercentages,
    topCategory,
    daysInCurrentMonth,
    currentDayOfMonth,
    daysLeftInMonth,
    dailyAllowanceOriginal,
    dailyRemainingBudget,
    currentDailyBurnRate,
    projectedMonthEndSpent,
    willExhaustEarly,
    projectedExhaustionDay,
  };
}
