import { CurrencyConfig, SectorItem } from './types';

export const PRIMARY_OLIVE = '#808000';

export const DEFAULT_SECTORS: SectorItem[] = [
  {
    id: 'sec-food',
    name: 'Food',
    color: '#808000', // Olive
    budgetRecommendation: 'Needs (25-35%)',
    isDefault: true,
  },
  {
    id: 'sec-transport',
    name: 'Transport',
    color: '#526e57', // Sage / Moss
    budgetRecommendation: 'Needs (10-15%)',
    isDefault: true,
  },
  {
    id: 'sec-games',
    name: 'Games',
    color: '#8e6b48', // Warm Umber
    budgetRecommendation: 'Wants (5-10%)',
    isDefault: true,
  },
  {
    id: 'sec-study',
    name: 'Study',
    color: '#b0842e', // Ochre
    budgetRecommendation: 'Growth (10-15%)',
    isDefault: true,
  },
  {
    id: 'sec-savings',
    name: 'Savings',
    color: '#3b7a57', // Amazon Green
    budgetRecommendation: 'Savings (20%)',
    isDefault: true,
  },
  {
    id: 'sec-other',
    name: 'Other',
    color: '#6e7069', // Khaki Gray
    budgetRecommendation: 'Wants/Misc (5-10%)',
    isDefault: true,
  },
];

export const SECTOR_COLOR_PALETTE = [
  '#808000', // Olive
  '#526e57', // Sage Moss
  '#8e6b48', // Warm Umber
  '#b0842e', // Ochre
  '#3b7a57', // Forest
  '#6e7069', // Khaki Gray
  '#a35339', // Rust Terracotta
  '#7b526d', // Muted Plum
  '#387779', // Deep Teal
  '#99892c', // Olive Gold
  '#4a6b82', // Slate Denim
  '#875b75', // Heather
];

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'NPR', symbol: 'Rs.', name: 'Nepalese Rupee (Rs.)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (¥)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (د.إ)' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (৳)' },
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee (Rs.)' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (RM)' },
];

export const DEFAULT_ALLOWANCE = 15000; // 15,000 NPR
export const DEFAULT_CURRENCY_CODE = 'NPR';

export const QUICK_ADD_AMOUNTS: Record<string, number[]> = {
  NPR: [500, 1000, 2000, 5000],
  INR: [500, 1000, 2000, 5000],
  USD: [10, 25, 50, 100],
  EUR: [10, 25, 50, 100],
  GBP: [10, 20, 50, 100],
  AUD: [10, 25, 50, 100],
  CAD: [10, 25, 50, 100],
  JPY: [1000, 2000, 5000, 10000],
};
