import { Expense } from '../types';

export function getSampleExpenses(): Expense[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  // Dates spread across the current month
  const d1 = `${year}-${month}-02`;
  const d2 = `${year}-${month}-05`;
  const d3 = `${year}-${month}-08`;
  const d4 = `${year}-${month}-12`;
  const d5 = `${year}-${month}-15`;
  const d6 = `${year}-${month}-18`;

  return [
    {
      id: 'sample-1',
      name: 'College Cafeteria Momos & Tea',
      amount: 1450,
      category: 'Food',
      date: d1,
      createdAt: Date.now() - 86400000 * 18,
      vibe: '🤤 Craving',
      excuse: 'Because life is short and momos get cold 🥟',
    },
    {
      id: 'sample-2',
      name: 'Monthly City Bus Pass',
      amount: 1200,
      category: 'Transport',
      date: d2,
      createdAt: Date.now() - 86400000 * 15,
      vibe: '😭 Adulting Pain',
      excuse: 'Paying to move atoms between coordinates 🚌',
    },
    {
      id: 'sample-3',
      name: 'Computer Science Reference Book',
      amount: 1650,
      category: 'Study',
      date: d3,
      createdAt: Date.now() - 86400000 * 12,
      vibe: '🧠 Big Brain',
      excuse: 'Investing in brain wrinkles for future riches 📚',
    },
    {
      id: 'sample-4',
      name: 'Steam Weekend Game Sale',
      amount: 950,
      category: 'Games',
      date: d4,
      createdAt: Date.now() - 86400000 * 8,
      vibe: '🚀 Impulse',
      excuse: 'Gaben smiled upon me, I had no resistance 🕹️',
    },
    {
      id: 'sample-5',
      name: 'Deposit to Goal Savings',
      amount: 3000,
      category: 'Savings',
      date: d5,
      createdAt: Date.now() - 86400000 * 5,
      vibe: '😇 Actually Needed',
      excuse: 'Squirrel mode activated! Stashing the nuts 🐿️',
    },
    {
      id: 'sample-6',
      name: 'Weekend Brunch with Friends',
      amount: 1100,
      category: 'Food',
      date: d6,
      createdAt: Date.now() - 86400000 * 2,
      vibe: '🙈 No Regrets',
      excuse: 'Scientifically proven to increase dopamine by 4.2% 🧪',
    },
  ];
}
