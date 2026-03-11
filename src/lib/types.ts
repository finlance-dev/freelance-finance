export interface Client {
  id: string;
  name: string;
  email: string;
  color: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: "active" | "completed" | "paused";
  hourlyRate: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  projectId: string | null;
  clientId: string | null;
  type: "income" | "expense";
  amount: number;
  date: string;
  description: string;
  category: string;
  currency?: string;
  withholdingTax?: number; // WHT amount (e.g. 3% of income)
}

export interface RecurringTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  clientId: string | null;
  projectId: string | null;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string | null;
  active: boolean;
  lastGenerated: string | null;
  currency?: string;
}

export interface TaxSettings {
  annualIncome: number;
  taxRate: number;
  deductions: number;
  quarter: number;
}

export type PlanType = "free" | "pro" | "pro_yearly";

export interface UserPlan {
  plan: PlanType;
  activatedAt: string;
  expiresAt: string | null;
}

export const PLAN_LIMITS = {
  free: {
    maxClients: 3,
    maxTransactions: 30,
    hasTaxEstimator: false,
    hasCashFlow: false,
    hasExport: false,
    hasProjectProfit: false,
  },
  pro: {
    maxClients: Infinity,
    maxTransactions: Infinity,
    hasTaxEstimator: true,
    hasCashFlow: true,
    hasExport: true,
    hasProjectProfit: true,
  },
  pro_yearly: {
    maxClients: Infinity,
    maxTransactions: Infinity,
    hasTaxEstimator: true,
    hasCashFlow: true,
    hasExport: true,
    hasProjectProfit: true,
  },
} as const;

export const SUPPORTED_CURRENCIES = [
  { code: "THB", symbol: "฿", name: "บาท" },
  { code: "USD", symbol: "$", name: "ดอลลาร์สหรัฐ" },
  { code: "EUR", symbol: "€", name: "ยูโร" },
  { code: "GBP", symbol: "£", name: "ปอนด์" },
  { code: "JPY", symbol: "¥", name: "เยน" },
  { code: "CNY", symbol: "¥", name: "หยวน" },
  { code: "KRW", symbol: "₩", name: "วอน" },
  { code: "SGD", symbol: "S$", name: "ดอลลาร์สิงคโปร์" },
  { code: "MYR", symbol: "RM", name: "ริงกิต" },
] as const;

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  avgMonthlyIncome: number;
  monthsOfRunway: number;
  estimatedQuarterlyTax: number;
}

export interface IncomeGoal {
  monthlyTarget: number;
  yearlyTarget: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  projectId: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}
