"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Target,
  Pencil,
  Check,
  X,
  Wallet,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { getTransactions, getClients, getMonthlyExpenses, getTaxRate, seedDemoData, getIncomeGoal, setIncomeGoal as saveIncomeGoal, getInvoices, getOverdueInvoiceCount } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { EmptyChartIllustration } from "@/components/illustrations";
import { useToast } from "@/components/toast";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useLocale } from "@/hooks/useLocale";
import Link from "next/link";
import { CurrencyConverter } from "@/components/currency-converter";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function getMonthlyData(transactions: Transaction[], locale: "th" | "en") {
  const months: Record<string, { income: number; expenses: number }> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short" });
    months[key] = { income: 0, expenses: 0 };
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short" });
    if (months[key]) {
      if (tx.type === "income") months[key].income += tx.amount;
      else months[key].expenses += tx.amount;
    }
  });

  return Object.entries(months).map(([month, data]) => ({
    month,
    ...data,
    profit: data.income - data.expenses,
  }));
}

function getExpensesByCategory(transactions: Transaction[]) {
  const categories: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const cat = tx.category || "อื่นๆ";
      categories[cat] = (categories[cat] || 0) + tx.amount;
    });
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getIncomeByClient(transactions: Transaction[], clients: { id: string; name: string; color: string }[]) {
  const clientMap: Record<string, { name: string; color: string; income: number }> = {};
  transactions
    .filter((tx) => tx.type === "income" && tx.clientId)
    .forEach((tx) => {
      const client = clients.find((c) => c.id === tx.clientId);
      if (client) {
        if (!clientMap[client.id]) clientMap[client.id] = { name: client.name, color: client.color, income: 0 };
        clientMap[client.id].income += tx.amount;
      }
    });
  return Object.values(clientMap).sort((a, b) => b.income - a.income);
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const [goalInput, setGoalInput] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const { toast } = useToast();
  const { isPro } = usePlan();
  const { locale, t } = useLocale();

  useEffect(() => {
    setTransactions(getTransactions());
    const goal = getIncomeGoal();
    setGoalInput(goal.monthlyTarget);
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const monthlyExpenses = getMonthlyExpenses();
    const taxRate = getTaxRate();
    const estimatedTax = totalIncome * (taxRate / 100);
    const monthsOfRunway = monthlyExpenses > 0 ? Math.floor(netProfit / monthlyExpenses) : 0;

    const now = new Date();
    const thisMonth = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "income" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonth = transactions
      .filter((t) => {
        const d = new Date(t.date);
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return t.type === "income" && d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      estimatedTax,
      monthsOfRunway: Math.max(0, monthsOfRunway),
      thisMonth,
      incomeChange,
    };
  }, [transactions]);

  const monthlyData = useMemo(() => getMonthlyData(transactions, locale), [transactions, locale]);
  const expenseData = useMemo(() => getExpensesByCategory(transactions), [transactions]);
  const clients = useMemo(() => getClients(), []);
  const clientIncomeData = useMemo(() => getIncomeByClient(transactions, clients), [transactions, clients]);
  const incomeGoal = useMemo(() => getIncomeGoal(), []);

  const goalProgress = incomeGoal.monthlyTarget > 0
    ? Math.min(100, (stats.thisMonth / incomeGoal.monthlyTarget) * 100)
    : 0;

  const savingsRate = stats.totalIncome > 0
    ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100)
    : 0;

  const recentTx = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const invoiceStats = useMemo(() => {
    const invoices = getInvoices();
    const overdueCount = getOverdueInvoiceCount();
    const paidCount = invoices.filter(i => i.status === "paid").length;
    const pendingCount = invoices.filter(i => i.status === "sent").length;
    const totalValue = invoices
      .filter(i => i.status === "sent" || i.status === "overdue")
      .reduce((sum, inv) => sum + inv.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0), 0);
    return { total: invoices.length, overdueCount, paidCount, pendingCount, totalValue };
  }, []);

  const handleSaveGoal = () => {
    saveIncomeGoal({ monthlyTarget: goalInput, yearlyTarget: goalInput * 12 });
    setEditingGoal(false);
    toast(t("dashboard", "goalSaved"));
  };

  if (!mounted) return null;

  const statCards = [
    {
      label: t("dashboard", "totalIncome"),
      value: formatCurrency(stats.totalIncome),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: t("dashboard", "totalExpenses"),
      value: formatCurrency(stats.totalExpenses),
      icon: TrendingDown,
      color: "text-danger",
      bg: "bg-danger/10",
    },
    {
      label: t("dashboard", "netProfit"),
      value: formatCurrency(stats.netProfit),
      icon: DollarSign,
      color: stats.netProfit >= 0 ? "text-accent" : "text-danger",
      bg: stats.netProfit >= 0 ? "bg-accent/10" : "bg-danger/10",
    },
    ...(isPro ? [{
      label: t("dashboard", "quarterlyTax"),
      value: formatCurrency(stats.estimatedTax / 4),
      icon: Calendar,
      color: "text-warning",
      bg: "bg-warning/10",
    }] : []),
  ];

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "13px",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard", "pageTitle")}</h1>
          <p className="text-muted text-sm mt-1">{t("dashboard", "pageSubtitle")}</p>
        </div>
        <button
          onClick={() => {
            seedDemoData();
            setTransactions(getTransactions());
          }}
          className="flex items-center gap-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition"
        >
          <Database className="w-3.5 h-3.5" />
          {t("dashboard", "loadDemo")}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">{stat.label}</span>
              <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* This Month + Income Goal */}
      <div className={`grid ${isPro ? "lg:grid-cols-2" : ""} gap-6`}>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">{t("dashboard", "thisMonth")}</h3>
            {stats.incomeChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${stats.incomeChange > 0 ? "text-accent" : "text-danger"}`}>
                {stats.incomeChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(stats.incomeChange).toFixed(0)}% {t("dashboard", "vsLastMonth")}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats.thisMonth)}</p>
          {stats.monthsOfRunway > 0 && stats.monthsOfRunway < 3 && (
            <div className="mt-3 flex items-center gap-2 text-warning text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{t("dashboard", "runwayWarning")}{stats.monthsOfRunway} {t("dashboard", "months")}</span>
            </div>
          )}
        </div>

        {/* Income Goal */}
        {isPro && <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("dashboard", "incomeGoal")}</h3>
            </div>
            {!editingGoal ? (
              <button
                onClick={() => setEditingGoal(true)}
                className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={handleSaveGoal} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingGoal(false)} className="p-1.5 text-muted hover:bg-secondary rounded-lg transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {editingGoal ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted">{t("dashboard", "goalMonthly")}</label>
                <input
                  type="number"
                  value={goalInput || ""}
                  onChange={(e) => setGoalInput(Number(e.target.value))}
                  placeholder={t("dashboard", "goalPlaceholder")}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ) : incomeGoal.monthlyTarget > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">
                  {formatCurrency(stats.thisMonth)} / {formatCurrency(incomeGoal.monthlyTarget)}
                </span>
                <span className={`font-semibold ${goalProgress >= 100 ? "text-accent" : "text-primary"}`}>
                  {goalProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    goalProgress >= 100
                      ? "bg-accent"
                      : goalProgress >= 70
                      ? "bg-primary"
                      : goalProgress >= 40
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                  style={{ width: `${Math.min(100, goalProgress)}%` }}
                />
              </div>
              {goalProgress >= 100 ? (
                <p className="text-sm text-accent font-medium">{t("dashboard", "goalReached")}</p>
              ) : (
                <p className="text-sm text-muted">
                  {t("dashboard", "goalRemaining")} {formatCurrency(incomeGoal.monthlyTarget - stats.thisMonth)}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted mb-2">{t("dashboard", "goalNotSet")}</p>
              <button
                onClick={() => setEditingGoal(true)}
                className="text-sm bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition"
              >
                {t("dashboard", "setGoal")}
              </button>
            </div>
          )}
        </div>}
      </div>

      {/* Charts — Pro only */}
      {!isPro ? (
        <UpgradePrompt
          feature={t("dashboard", "chartsUpgrade")}
          description={t("dashboard", "chartsUpgradeDesc")}
        />
      ) : (
        <>
          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Income Trend Area Chart */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4">{t("dashboard", "profitTrend")}</h3>
              {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={tooltipStyle}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                      name={t("dashboard", "profit")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-muted text-sm gap-3">
                  <EmptyChartIllustration className="w-40 h-auto" />
                  <p>{t("dashboard", "addToSeeChart")}</p>
                </div>
              )}
            </div>

            {/* Monthly Income vs Expenses Bar Chart */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4">{t("dashboard", "incomeVsExpense")}</h3>
              {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={tooltipStyle}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={t("common", "income")} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name={t("common", "expense")} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-muted text-sm gap-3">
                  <EmptyChartIllustration className="w-40 h-auto" />
                  <p>{t("dashboard", "addToSeeChart")}</p>
                  <button
                    onClick={() => {
                      seedDemoData();
                      setTransactions(getTransactions());
                    }}
                    className="flex items-center gap-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    {t("dashboard", "loadDemo")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expense Pie + Client Income */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4">{t("dashboard", "expenseByCategory")}</h3>
              {expenseData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {expenseData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 w-full sm:flex-1">
                    {expenseData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-muted truncate">{item.name}</span>
                        <span className="font-medium ml-auto whitespace-nowrap">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted text-sm">
                  <EmptyChartIllustration className="w-36 h-auto mb-3" />
                  {t("dashboard", "addExpenseToSee")}
                </div>
              )}
            </div>

            {/* Income by Client */}
            {clientIncomeData.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-4">{t("dashboard", "incomeByClient")}</h3>
                <div className="space-y-3">
                  {clientIncomeData.slice(0, 5).map((item, i) => {
                    const maxIncome = clientIncomeData[0].income;
                    const widthPercent = (item.income / maxIncome) * 100;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                              style={{ backgroundColor: item.color }}
                            >
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium truncate">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap">{formatCurrency(item.income)}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Recent Transactions + Quick Stats + Currency */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t("dashboard", "recentTransactions")}
            </h3>
            <Link href="/dashboard/transactions" className="text-xs text-primary hover:underline">
              {t("dashboard", "viewAll")} →
            </Link>
          </div>
          {recentTx.length > 0 ? (
            <div className="space-y-2">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-accent/10" : "bg-danger/10"}`}>
                      {tx.type === "income" ? <ArrowUpRight className="w-4 h-4 text-accent" /> : <ArrowDownRight className="w-4 h-4 text-danger" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold whitespace-nowrap ml-2 ${tx.type === "income" ? "text-accent" : "text-danger"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted text-sm">
              <p>{t("dashboard", "noTransactions")}</p>
            </div>
          )}
        </div>

        {/* Right column: Savings Rate + Invoice Overview */}
        <div className="space-y-6">
          {/* Savings Rate */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("dashboard", "savingsRate")}</h3>
            </div>
            <div className="flex items-center justify-center py-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--secondary)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={savingsRate >= 30 ? "var(--accent)" : savingsRate >= 10 ? "var(--warning)" : "var(--danger)"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(0, Math.min(100, savingsRate)) * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${savingsRate >= 30 ? "text-accent" : savingsRate >= 10 ? "text-warning" : "text-danger"}`}>
                    {savingsRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted mt-1">
              {savingsRate >= 30 ? t("dashboard", "savingsGood") : savingsRate >= 10 ? t("dashboard", "savingsOk") : t("dashboard", "savingsLow")}
            </p>
          </div>

          {/* Invoice Overview */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t("dashboard", "invoiceOverview")}</h3>
              </div>
              <Link href="/dashboard/invoices" className="text-xs text-primary hover:underline">
                {t("dashboard", "viewAll")}
              </Link>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">{t("dashboard", "invoicePaid")}</span>
                <span className="font-medium text-accent">{invoiceStats.paidCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">{t("dashboard", "invoicePending")}</span>
                <span className="font-medium text-warning">{invoiceStats.pendingCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">{t("dashboard", "invoiceOverdue")}</span>
                <span className="font-medium text-danger">{invoiceStats.overdueCount}</span>
              </div>
              {invoiceStats.totalValue > 0 && (
                <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
                  <span className="text-muted">{t("dashboard", "invoiceOutstanding")}</span>
                  <span className="font-semibold">{formatCurrency(invoiceStats.totalValue)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Converter */}
      <CurrencyConverter />
    </div>
  );
}
