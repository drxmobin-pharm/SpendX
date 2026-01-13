
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  password?: string;
  currencyCode: string;
  isLoggedIn: boolean;
  avatar?: string; // Base64 encoded image
  monthlyIncome: number; // Added field for base monthly income
}

export interface ChartDataPoint {
  name: string;
  income: number;
  expense: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
}
