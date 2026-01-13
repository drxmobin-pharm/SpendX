
import { Currency } from './types';

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other'
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Transport',
  'Entertainment',
  'Shopping',
  'Health',
  'Other'
];

export const FINANCIAL_TIPS = [
  "Follow the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
  "Set a monthly budget for each category to avoid overspending.",
  "Track every small expense; they add up quickly over time.",
  "Review your subscriptions regularly and cancel what you don't use.",
  "Aim to build an emergency fund that covers 3-6 months of expenses.",
  "Automate your savings to pay yourself first before spending.",
  "Avoid impulse purchases by waiting 24 hours before buying non-essentials."
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' }
];
