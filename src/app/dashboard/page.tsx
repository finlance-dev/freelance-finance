"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  FileText,
  Settings,
} from "lucide-react";
import dynamic from "next/dynamic";

const DashboardCharts = dynamic(() => import("@/components/dashboard-charts"), {
  ssr: false,
  loading: () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-5 h-[320px] animate-pulse" />
      <div className="bg-card border border-border rounded-2xl p-5 h-[320px] animate-pulse" />
    </div>
  ),
});
import { getTransactions, getClients, getMonthlyExpenses, getTaxRate, seedDemoData, getIncomeGoal, setIncomeGoal as saveIncomeGoal, getInvoices, getOverdueInvoiceCount } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

import { useToast } from "@/components/toast";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useLocale } from "@/hooks/useLocale";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/skeleton";
import { OnboardingModal } from "@/components/onboarding-modal";

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
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const widgetSettingsRef = useRef<HTMLDivElement>(null);

  const defaultWidgets = { statCards: true, thisMonth: true, incomeGoal: true, recentTx: true, profitTrend: true, incomeVsExpense: true, expenseByCategory: true, incomeByClient: true };
  const [widgetPrefs, setWidgetPrefs] = useState(defaultWidgets);

  const toggleWidget = (key: keyof typeof defaultWidgets) => {
    const updated = { ...widgetPrefs, [key]: !widgetPrefs[key] };
    setWidgetPrefs(updated);
    localStorage.setItem("ff_dashboard_widgets", JSON.stringify(updated));
  };

  useEffect(() => {
    const saved = localStorage.getItem("ff_dashboard_widgets");
    if (saved) {
      try { setWidgetPrefs({ ...defaultWidgets, ...JSON.parse(saved) }); } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close widget settings on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (widgetSettingsRef.current && !widgetSettingsRef.current.contains(e.target as Node)) {
        setShowWidgetSettings(false);
      }
    };
    if (showWidgetSettings) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showWidgetSettings]);

  useEffect(() => {
    setTransactions(getTransactions());
    const goal = getIncomeGoal();
    setGoalInput(goal.monthlyTarget);
    setMounted(true);

    // Listen for demo load from onboarding modal
    const handleLoadDemo = () => {
      seedDemoData();
      setTransactions(getTransactions());
      toast("โหลดข้อมูลตัวอย่างแล้ว", "success");
    };
    window.addEventListener("ff_load_demo", handleLoadDemo);
    return () => window.removeEventListener("ff_load_demo", handleLoadDemo);
  }, [toast]);

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

  if (!mounted) return <DashboardSkeleton />;

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



  return (
    <div className="space-y-6">
      <OnboardingModal />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard", "pageTitle")}</h1>
          <p className="text-muted text-sm mt-1">{t("dashboard", "pageSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={widgetSettingsRef}>
            <button
              onClick={() => setShowWidgetSettings(!showWidgetSettings)}
              className="flex items-center gap-2 text-xs bg-secondary text-muted hover:text-foreground px-3 py-2 rounded-xl transition"
              title={t("dashboard", "customizeWidgets")}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            {showWidgetSettings && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg p-3 z-50 space-y-1">
                <p className="text-xs font-semibold text-muted mb-2">{t("dashboard", "customizeWidgets")}</p>
                {([
                  ["statCards", "widgetStatCards"],
                  ["thisMonth", "widgetThisMonth"],
                  ["incomeGoal", "widgetIncomeGoal"],
                  ["recentTx", "widgetRecentTx"],
                  ["profitTrend", "widgetProfitTrend"],
                  ["incomeVsExpense", "widgetIncomeVsExpense"],
                  ["expenseByCategory", "widgetExpenseByCategory"],
                  ["incomeByClient", "widgetIncomeByClient"],
                ] as [keyof typeof defaultWidgets, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={widgetPrefs[key]}
                      onChange={() => toggleWidget(key)}
                      className="rounded border-border accent-primary"
                    />
                    {t("dashboard", label as any)}
                  </label>
                ))}
              </div>
            )}
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
      </div>

      {/* Stat Cards */}
      {widgetPrefs.statCards && (
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
      )}

      {/* This Month + Income Goal */}
      <div className={`grid ${isPro && widgetPrefs.incomeGoal ? "lg:grid-cols-2" : ""} gap-6`}>
        {widgetPrefs.thisMonth && <div className="bg-card border border-border rounded-2xl p-5">
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
        </div>}

        {/* Income Goal */}
        {isPro && widgetPrefs.incomeGoal && <div className="bg-card border border-border rounded-2xl p-5">
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

      {/* Recent Transactions */}
      {widgetPrefs.recentTx && <div className="bg-card border border-border rounded-2xl p-5">
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
      </div>}

      {/* Charts — Pro only */}
      {!isPro ? (
        <UpgradePrompt
          feature={t("dashboard", "chartsUpgrade")}
          description={t("dashboard", "chartsUpgradeDesc")}
        />
      ) : (
        <DashboardCharts
          monthlyData={monthlyData}
          expenseData={expenseData}
          clientIncomeData={clientIncomeData}
          hasTransactions={transactions.length > 0}
          widgetPrefs={widgetPrefs}
          onLoadDemo={() => {
            seedDemoData();
            setTransactions(getTransactions());
          }}
          t={t as any}
        />
      )}

    </div>
  );
}
