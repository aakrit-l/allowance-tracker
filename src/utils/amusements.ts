export interface AmusingVibe {
  id: string;
  emoji: string;
  label: string;
}

export const AMUSING_VIBES: AmusingVibe[] = [
  { id: 'craving', emoji: '🤤', label: 'Craving' },
  { id: 'impulse', emoji: '🚀', label: 'Impulse' },
  { id: 'pain', emoji: '😭', label: 'Adulting Pain' },
  { id: 'big_brain', emoji: '🧠', label: 'Big Brain' },
  { id: 'pure_need', emoji: '😇', label: 'Actually Needed' },
  { id: 'regret_nothing', emoji: '🙈', label: 'No Regrets' },
];

export const FUNNY_EXCUSES = [
  'Because life is short and momos get cold 🥟',
  'Scientifically proven to increase dopamine by 4.2% 🧪',
  'The cashier made eye contact and I panicked 👁️',
  'Future me will solve this financial crisis 🔮',
  'My wallet was looking dangerously thick anyway 💳',
  'Mercury was in retrograde, I had no choice 🪐',
  'Invested heavily in emotional resilience 🧘',
  'A calculated risk, but man I am bad at math 🧮',
  'I walked 500 steps today, so this was basically free 🏃',
  'It called my name from across the counter 🗣️',
  'Technically, it was an emergency morale booster 🚨',
  'Economists recommend circulating currency, I did my civic duty 🏛️',
];

export function getRandomExcuse(): string {
  const idx = Math.floor(Math.random() * FUNNY_EXCUSES.length);
  return FUNNY_EXCUSES[idx];
}

export function getWittyExpenseReaction(
  category: string,
  name: string,
  amount: number,
  currencySymbol: string
): { title: string; quote: string; emoji: string } {
  const cat = category.toLowerCase();
  const cleanSym = !currencySymbol || currencySymbol === '₨' ? 'Rs.' : currencySymbol;
  const sym = cleanSym.length > 1 || cleanSym.endsWith('.') ? `${cleanSym} ` : cleanSym;

  // Special Savings celebration
  if (cat.includes('saving')) {
    return {
      title: 'Squirrel Mode Activated! 🐿️',
      quote: `Future you is shedding a tear of joy. +${sym}${amount.toLocaleString()} safely locked away!`,
      emoji: '💰',
    };
  }

  // Food
  if (cat.includes('food') || cat.includes('meal') || cat.includes('snack')) {
    const foodQuips = [
      `Fed your stomach, starved your wallet. Worth it? Absolutely! 🥟`,
      `Your taste buds are throwing a party, your balance is in mourning. 🍜`,
      `Calories consumed, coins departed. That is the circle of life! ☕`,
      `Chef's kiss on the tongue, mild panic on the bank statement. 🍕`,
    ];
    return {
      title: 'Nutritional Sacrifice 🍽️',
      quote: foodQuips[Math.floor(Math.random() * foodQuips.length)],
      emoji: '🤤',
    };
  }

  // Transport
  if (cat.includes('transport') || cat.includes('travel') || cat.includes('commute')) {
    const transitQuips = [
      `Look at you, paying to move your atoms between geographical coordinates! 🚌`,
      `Zooming away from your financial discipline at 40 km/h. 🚗`,
      `Legs exist for free, but comfort was calling your name. 🚶`,
    ];
    return {
      title: 'Motion Sickness for Your Wallet 🗺️',
      quote: transitQuips[Math.floor(Math.random() * transitQuips.length)],
      emoji: '🚀',
    };
  }

  // Games & Entertainment
  if (cat.includes('game') || cat.includes('fun') || cat.includes('entertainment')) {
    const gameQuips = [
      `That skin definitely grants +10 gameplay skill, right? 🎮`,
      `Another masterpiece added to your digital backlog of shame. 🕹️`,
      `Voluntary tax paid to the dopamine gods. GG! 🏆`,
    ];
    return {
      title: 'Level Up... Balance Down 👾',
      quote: gameQuips[Math.floor(Math.random() * gameQuips.length)],
      emoji: '🎮',
    };
  }

  // Study
  if (cat.includes('study') || cat.includes('book') || cat.includes('course')) {
    const studyQuips = [
      `Investing in brain wrinkles! Harvard called, they respect the grind. 📚`,
      `Knowledge is priceless... but textbooks are highway robbery. 🧠`,
      `May this purchase increase your GPA by at least 0.5 points. 🎓`,
    ];
    return {
      title: 'Galaxy Brain Transaction 📖',
      quote: studyQuips[Math.floor(Math.random() * studyQuips.length)],
      emoji: '🧠',
    };
  }

  // Large spend check
  if (amount > 3000) {
    return {
      title: 'Sound the Budget Sirens! 🚨',
      quote: `Oof, that was a chonky bite out of your balance (${sym}${amount.toLocaleString()}). Drink water and stay humble!`,
      emoji: '💸',
    };
  }

  // General default witty reactions
  const defaultQuips = [
    `Transaction logged! Money was printed to be circulated, right? 💸`,
    `A moment on the receipt, forever on your conscience. 🧾`,
    `Receipt captured! May your wallet rest in peace. 💳`,
    `Duly noted in the archives of questionable decisions! 📝`,
  ];

  return {
    title: 'Wallet Debited! 💳',
    quote: defaultQuips[Math.floor(Math.random() * defaultQuips.length)],
    emoji: '✨',
  };
}

export function getQuickAmusingPresets(currencyCode: string): Array<{
  name: string;
  amount: number;
  category: string;
  vibe: string;
  emoji: string;
}> {
  if (currencyCode === 'NPR' || currencyCode === 'INR') {
    return [
      { name: 'Emergency C-Momo Fix', amount: 180, category: 'Food', vibe: '🤤 Craving', emoji: '🥟' },
      { name: 'Chiya & Samosa Morale Fuel', amount: 90, category: 'Food', vibe: '😇 Actually Needed', emoji: '☕' },
      { name: 'Micro-bus Survival Journey', amount: 35, category: 'Transport', vibe: '😭 Adulting Pain', emoji: '🚌' },
      { name: 'Steam Sale Impulse Buy', amount: 750, category: 'Games', vibe: '🚀 Impulse', emoji: '🎮' },
      { name: 'Stationery I Will Never Use', amount: 240, category: 'Study', vibe: '🙈 No Regrets', emoji: '✏️' },
      { name: 'Secret Squirrel Piggy Deposit', amount: 500, category: 'Savings', vibe: '🧠 Big Brain', emoji: '🐿️' },
    ];
  }

  // Default USD/EUR/etc.
  return [
    { name: 'Iced Caramel Caffeine Overdose', amount: 6.5, category: 'Food', vibe: '🤤 Craving', emoji: '☕' },
    { name: 'Artisanal Sourdough & Pastry', amount: 9.0, category: 'Food', vibe: '🚀 Impulse', emoji: '🥐' },
    { name: 'Emergency Ride Share', amount: 14.0, category: 'Transport', vibe: '😭 Adulting Pain', emoji: '🚕' },
    { name: 'Steam Weekend Discount Regret', amount: 15.0, category: 'Games', vibe: '🙈 No Regrets', emoji: '🎮' },
    { name: 'Fancy Aesthetic Notebook', amount: 12.0, category: 'Study', vibe: '🧠 Big Brain', emoji: '📓' },
    { name: 'Responsible Adult Deposit', amount: 25.0, category: 'Savings', vibe: '😇 Actually Needed', emoji: '🐖' },
  ];
}
