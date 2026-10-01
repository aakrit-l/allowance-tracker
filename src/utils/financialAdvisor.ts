import { BudgetSummary, CurrencyConfig, Expense, ExpenseCategory } from '../types';

export function generateLocalFinancialAdvice(
  promptType: string,
  allowance: number,
  currency: CurrencyConfig,
  summary: BudgetSummary,
  expenses: Expense[]
): string {
  const rawSym = !currency?.symbol || currency.symbol === '₨' ? 'Rs.' : currency.symbol;
  const sym = rawSym.length > 1 || rawSym.endsWith('.') ? `${rawSym} ` : rawSym;
  const code = currency.code;
  const lowerPrompt = promptType.toLowerCase();

  // If user has not set an allowance
  if (allowance <= 0) {
    return `👋 **Welcome to your Allowance Planner!**\n\nTo get personalized financial advice, start by entering your **monthly allowance** above (e.g., ${sym}10,000 ${code}). Once you log a few expenses, I'll calculate your exact burn rate, 50/30/20 split, and money-saving opportunities.`;
  }

  // Roast My Spending (Amusing Financial Roaster)
  if (lowerPrompt.includes('roast') || lowerPrompt.includes('judge') || lowerPrompt.includes('savage')) {
    if (expenses.length === 0) {
      return `🔥 **The AI Roast Machine:**\n\nI can't roast you yet because you haven't recorded a single expense! Are you hiding your guilty receipts in another dimension, or are you actually a budgeting monk living on sunshine and clean air? 🧘‍♂️\n\n*Log 2-3 expenses and come back if you dare.*`;
    }

    const top = summary.topCategory ? summary.topCategory.category : 'General';
    const topAmt = summary.topCategory ? summary.topCategory.amount : 0;
    const pct = summary.percentageSpent.toFixed(0);

    return `🔥 **Roast My Spending Mode: ACTIVATED** 🔥\n\n` +
      `Look at you, strutting around like a billionaire while **${pct}%** of your ${sym}${allowance.toLocaleString()} allowance has already vanished into thin air! 💸\n\n` +
      `• **Your Arch-Nemesis:** You gave **${sym}${topAmt.toLocaleString()}** to **${top}**. Did you adopt a herd of cows or are you single-handedly keeping the local food joint in business?\n` +
      (summary.status === 'exceeded'
        ? `• **Current Status:** You are officially in negative territory by ${sym}${Math.abs(summary.remaining).toLocaleString()}. If your wallet could file for emancipation, it would have left yesterday. 🚨\n`
        : `• **The Pacing:** You have ${sym}${summary.remaining.toLocaleString()} left for ${summary.daysLeftInMonth} days. That's ${sym}${summary.dailyRemainingBudget.toFixed(0)}/day. Hope you enjoy the gourmet delicacy known as "instant noodles with tap water". 🍜\n`) +
      `\n💡 *Verdict:* You're not broke yet, but your wallet is praying for month-end. Drink some water and leave your cards at home today! 😉`;
  }

  // 1. Analyze Spending
  if (
    lowerPrompt.includes('analyze') ||
    lowerPrompt.includes('spending') ||
    lowerPrompt.includes('summary') ||
    lowerPrompt.includes('overview')
  ) {
    if (expenses.length === 0) {
      return `📊 **Spending Analysis**\n\n- **Monthly Allowance:** ${sym}${allowance.toLocaleString()} ${code}\n- **Total Spent:** ${sym}0 (0%)\n- **Available Balance:** ${sym}${allowance.toLocaleString()}\n- **Daily Safe Spend:** ${sym}${summary.dailyRemainingBudget.toFixed(0)}/day for the next ${summary.daysLeftInMonth} days\n\n💡 *You haven't recorded any expenses yet. As you add food, transit, or game expenses, I'll identify your spending habits!*`;
    }

    const top = summary.topCategory;
    const overspentCats = Object.entries(summary.categoryTotals)
      .filter(([_, amt]) => allowance > 0 && amt / allowance > 0.25)
      .map(([cat, amt]) => `${cat} (${sym}${amt.toLocaleString()}, ${((amt / allowance) * 100).toFixed(0)}% of allowance)`);

    let paceInsight = '';
    if (summary.status === 'exceeded') {
      paceInsight = `🚨 **Over Budget Warning:** You have exceeded your allowance by **${sym}${Math.abs(summary.remaining).toLocaleString()}**. Freeze all discretionary spending (Games, dining out) immediately.`;
    } else if (summary.willExhaustEarly && summary.projectedExhaustionDay) {
      paceInsight = `⚠️ **Burn Rate Alert:** At your current pace of **${sym}${summary.currentDailyBurnRate.toFixed(0)}/day**, your funds may run out around **Day ${summary.projectedExhaustionDay}** of this month. Slow down to **${sym}${summary.dailyRemainingBudget.toFixed(0)}/day** to last.`;
    } else {
      paceInsight = `✅ **Pace is Healthy:** You have **${sym}${summary.remaining.toLocaleString()}** left. Spending up to **${sym}${summary.dailyRemainingBudget.toFixed(0)}/day** keeps you safe through month-end.`;
    }

    return `📊 **Spending Health Report**\n\n` +
      `- **Total Allowance:** ${sym}${allowance.toLocaleString()} ${code}\n` +
      `- **Spent So Far:** ${sym}${summary.totalSpent.toLocaleString()} (${summary.percentageSpent.toFixed(1)}%)\n` +
      `- **Remaining Pool:** ${sym}${summary.remaining.toLocaleString()}\n` +
      `- **Primary Outflow:** ${top ? `**${top.category}** (${sym}${top.amount.toLocaleString()} or ${top.percentage.toFixed(0)}% of all expenses)` : 'None'}\n\n` +
      `${paceInsight}\n\n` +
      (overspentCats.length > 0 ? `🔍 **High Concentration Categories:**\n` + overspentCats.map(c => `• ${c}`).join('\n') + `\n\n` : '') +
      `💡 **Quick Win:** Try setting a small cap of ${sym}${(allowance * 0.1).toFixed(0)} on non-essential categories this week!`;
  }

  // 2. Budget Split (50/30/20 Rule)
  if (
    lowerPrompt.includes('split') ||
    lowerPrompt.includes('50/30/20') ||
    lowerPrompt.includes('rule') ||
    lowerPrompt.includes('allocate') ||
    lowerPrompt.includes('budget')
  ) {
    const needsTarget = allowance * 0.5;
    const wantsTarget = allowance * 0.3;
    const savingsTarget = allowance * 0.2;

    const actualNeeds = (summary.categoryTotals.Food || 0) + (summary.categoryTotals.Transport || 0) + (summary.categoryTotals.Study || 0);
    const actualWants = (summary.categoryTotals.Games || 0) + (summary.categoryTotals.Other || 0);
    const actualSavings = summary.categoryTotals.Savings || 0;

    return `⚖️ **Recommended 50 / 30 / 20 Budget Split for ${sym}${allowance.toLocaleString()}**\n\n` +
      `1. **Needs (50% target = ${sym}${needsTarget.toLocaleString()}):**\n` +
      `   • Covers essential Food, Transport, and Study materials.\n` +
      `   • Your current spend: **${sym}${actualNeeds.toLocaleString()}** (${allowance > 0 ? ((actualNeeds / allowance) * 100).toFixed(0) : 0}%)\n\n` +
      `2. **Wants (30% target = ${sym}${wantsTarget.toLocaleString()}):**\n` +
      `   • Covers Games, eating out with friends, subscriptions, entertainment.\n` +
      `   • Your current spend: **${sym}${actualWants.toLocaleString()}** (${allowance > 0 ? ((actualWants / allowance) * 100).toFixed(0) : 0}%)\n\n` +
      `3. **Savings (20% target = ${sym}${savingsTarget.toLocaleString()}):**\n` +
      `   • Direct deposit into emergency fund, piggy bank, or savings goal.\n` +
      `   • Your current saved: **${sym}${actualSavings.toLocaleString()}** (${allowance > 0 ? ((actualSavings / allowance) * 100).toFixed(0) : 0}%)\n\n` +
      `💡 *Action Step:* Set aside ${sym}${savingsTarget.toLocaleString()} right at the beginning of the month before spending on wants!`;
  }

  // 3. How to Save More
  if (
    lowerPrompt.includes('save') ||
    lowerPrompt.includes('tips') ||
    lowerPrompt.includes('cut') ||
    lowerPrompt.includes('frugal')
  ) {
    const highestCat: string = summary.topCategory ? summary.topCategory.category : 'Food';

    const tips: Record<string, string[]> = {
      Food: [
        `Pack homemade snacks, fruits, or a refillable water flask when heading to classes or work.`,
        `Swap 2 restaurant meals a week for simple cooking or street-side tea; can save ${sym}${(allowance * 0.08).toFixed(0)}+ monthly.`,
        `Shop groceries with a strict list to prevent impulse snack purchases.`,
      ],
      Transport: [
        `Make use of student / monthly concession transit passes or shared micro-bus routes.`,
        `Walk for trips under 15 minutes—healthy and saves immediate petty cash.`,
        `Group rides with classmates or colleagues instead of solo ride-shares.`,
      ],
      Games: [
        `Take advantage of free-to-play titles, seasonal discounts, or library sharing before full-price purchases.`,
        `Pause or rotate recurring monthly digital gaming passes you aren't actively playing.`,
        `Set a strict "cooling off period" of 48 hours before buying in-game skins or cosmetics.`,
      ],
      Study: [
        `Look for digital open-source PDFs or secondhand senior textbooks instead of brand-new copies.`,
        `Use campus libraries and group study rooms rather than spending at cafes.`,
        `Check student discounts on software (GitHub Student Pack, Notion, Spotify).`,
      ],
      Savings: [
        `Automate your savings deposit as soon as your allowance is received.`,
        `Store savings in a separate locked account or digital piggy bank to resist temptation.`,
        `Set milestone rewards for hitting 3 months of consecutive positive savings!`,
      ],
      Other: [
        `Review micro-transactions: small everyday purchases under ${sym}100 add up rapidly.`,
        `Try a "No-Spend Weekend" challenge once a month for non-essentials.`,
        `Track every single expense on this planner immediately after paying!`,
      ],
    };

    const specificTips = tips[highestCat] || tips.Food;

    return `💡 **Practical Ways to Save More This Month**\n\n` +
      `Based on your current outflow, your highest expense is **${highestCat}** (${sym}${(summary.categoryTotals[highestCat] || 0).toLocaleString()}). Here is a customized action plan:\n\n` +
      specificTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n') +
      `\n\n🎯 **Immediate Goal:** Cut just ${sym}${(summary.dailyRemainingBudget * 0.2).toFixed(0)} per day to stash an extra **${sym}${(summary.dailyRemainingBudget * 0.2 * summary.daysLeftInMonth).toFixed(0)}** by month-end!`;
  }

  // 4. Pace / Exhaustion Warning
  if (
    lowerPrompt.includes('pace') ||
    lowerPrompt.includes('exhaust') ||
    lowerPrompt.includes('last') ||
    lowerPrompt.includes('track') ||
    lowerPrompt.includes('run out')
  ) {
    if (summary.status === 'exceeded') {
      return `🚨 **Allowance Exhausted!**\n\n- You have spent **${sym}${summary.totalSpent.toLocaleString()}**, which is **${sym}${Math.abs(summary.remaining).toLocaleString()}** over your ${sym}${allowance.toLocaleString()} allowance.\n- There are still **${summary.daysLeftInMonth} days** remaining in the month.\n\n🛡️ **Survival Strategy:**\n1. Stop all non-essential outflows (Games, dining out, luxury).\n2. If possible, allocate from previous emergency savings or find a micro-gig.\n3. Reset your budget targets for next month with a strict daily allowance.`;
    }

    if (summary.willExhaustEarly && summary.projectedExhaustionDay) {
      return `⚠️ **Pace Warning: Early Exhaustion Risk**\n\n` +
        `- **Current Burn Rate:** ${sym}${summary.currentDailyBurnRate.toFixed(0)}/day\n` +
        `- **Projected Depletion Date:** Around **Day ${summary.projectedExhaustionDay}** (${summary.daysInCurrentMonth - summary.projectedExhaustionDay} days before month-end!)\n` +
        `- **Remaining Balance:** ${sym}${summary.remaining.toLocaleString()} for ${summary.daysLeftInMonth} days\n\n` +
        `📉 **How to fix it:**\n` +
        `Lower your daily spending cap to **${sym}${summary.dailyRemainingBudget.toFixed(0)}/day** starting today. This simple adjustment ensures your money lasts comfortably until the last day of the month!`;
    }

    return `⏱️ **Pace Assessment: Looking Good!**\n\n` +
      `- **Remaining Allowance:** ${sym}${summary.remaining.toLocaleString()} (${(100 - summary.percentageSpent).toFixed(1)}% left)\n` +
      `- **Days Left in Month:** ${summary.daysLeftInMonth} days\n` +
      `- **Allowed Daily Budget:** ${sym}${summary.dailyRemainingBudget.toFixed(0)}/day\n` +
      `- **Current Daily Burn Rate:** ${sym}${summary.currentDailyBurnRate.toFixed(0)}/day\n\n` +
      `🎉 You are pacing comfortably below your limit. If you maintain this rhythm, you'll finish the month with a surplus of ~${sym}${Math.max(0, summary.remaining - (summary.currentDailyBurnRate * summary.daysLeftInMonth)).toFixed(0)} to roll into your **Savings**!`;
  }

  // 5. Default General Question / Fallback
  return `💬 **Advisor Note**\n\n` +
    `You are currently managing **${sym}${allowance.toLocaleString()} ${code}** with **${sym}${summary.remaining.toLocaleString()}** remaining (${summary.percentageSpent.toFixed(0)}% used).\n\n` +
    `• **Daily Target:** Aim for under **${sym}${summary.dailyRemainingBudget.toFixed(0)}/day** over the next ${summary.daysLeftInMonth} days.\n` +
    `• **Top Category:** ${summary.topCategory ? `${summary.topCategory.category} (${sym}${summary.topCategory.amount.toLocaleString()})` : 'None yet'}.\n\n` +
    `Try asking:\n` +
    `• *"Where am I overspending?"*\n` +
    `• *"How can I save more?"*\n` +
    `• *"Recommended budget split"*`;
}
