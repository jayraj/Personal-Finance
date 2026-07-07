export interface User {
  id: string;
  email: string;
  displayName: string;
  preferredCurrency: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  isPredefined: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  date: string;
  notes: string | null;
  receipts?: Receipt[];
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  expenseId: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  categoryName?: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  rollover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "BUDGET_80PCT" | "BUDGET_EXCEEDED" | "WEEKLY_SUMMARY";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  inApp: boolean;
  email: boolean;
  push: boolean;
  thresholdPercent: number;
  weeklySummary: boolean;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalSpent: number;
  averageDaily: number;
  topCategory: string;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export interface TrendsData {
  period: "7d" | "30d" | "12m";
  dataPoints: { date: string; amount: number }[];
  movingAverage?: { date: string; amount: number }[];
}

export interface ComparisonReport {
  monthA: { month: number; year: number; total: number };
  monthB: { month: number; year: number; total: number };
  difference: number;
  percentageChange: number;
  categories: {
    category: string;
    amountA: number;
    amountB: number;
    change: number;
    highlighted: boolean;
  }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}
