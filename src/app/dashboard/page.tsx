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
} from "recharts";
import { getTransactions, getClients, getMonthlyExpenses, getTaxRate, seedDemoData } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { EmptyChartIllustration } from "@/components/illustrations";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function getMonthlyData(transactions: Transaction[]) {
  const months: Record<string, { income: number; expenses: number }> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("th-TH", { month: "short" });
    months[key] = { income: 0, expenses: 0 };
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString("th-TH", { month: "short" });
    if (months[key]) {
      if (tx.type === "income") months[key].income += tx.amount;
      else months[key].expenses += tx.amount;
    }
  });

  return Object.entries(months).map(([month, data]) => ({
    month,
    ...data,
  }));
}

function getExpensesByCategory(transactions: Transaction[]) {
  const categories: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const cat = tx.category || "Other";
      categories[cat] = (categories[cat] || 0) + tx.amount;
    });
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTransactions(getTransactions());
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

    // Income this month vs last month
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

  const monthlyData = useMemo(() => getMonthlyData(transactions), [transactions]);
  const expenseData = useMemo(() => getExpensesByCategory(transactions), [transactions]);
  const clients = useMemo(() => getClients(), []);

  if (!mounted) return null;

  const statCards = [
    {
      label: "รายได้รวม",
      value: formatCurrency(stats.totalIncome),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "ค่าใช้จ่ายรวม",
      value: formatCurrency(stats.totalExpenses),
      icon: TrendingDown,
      color: "text-danger",
      bg: "bg-danger/10",
    },
    {
      label: "กำไรสุทธิ",
      value: formatCurrency(stats.netProfit),
      icon: DollarSign,
      color: stats.netProfit >= 0 ? "text-accent" : "text-danger",
      bg: stats.netProfit >= 0 ? "bg-accent/10" : "bg-danger/10",
    },
    {
      label: "ภาษีรายไตรมาส (ประมาณ)",
      value: formatCurrency(stats.estimatedTax / 4),
      icon: Calendar,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
          <p className="text-muted text-sm mt-1">ภาพรวมการเงินของคุณ</p>
        </div>
        <button
          onClick={() => {
            seedDemoData();
            setTransactions(getTransactions());
          }}
          className="flex items-center gap-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition"
        >
          <Database className="w-3.5 h-3.5" />
          โหลดข้อมูลตัวอย่าง
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

      {/* This Month Summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">เดือนนี้</h3>
          {stats.incomeChange !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${stats.incomeChange > 0 ? "text-accent" : "text-danger"}`}>
              {stats.incomeChange > 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.incomeChange).toFixed(0)}% เทียบเดือนที่แล้ว
            </div>
          )}
        </div>
        <p className="text-3xl font-bold">{formatCurrency(stats.thisMonth)}</p>
        {stats.monthsOfRunway > 0 && stats.monthsOfRunway < 3 && (
          <div className="mt-3 flex items-center gap-2 text-warning text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>เงินเหลือใช้ได้อีก ~{stats.monthsOfRunway} เดือน</span>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">รายรับ vs รายจ่าย (6 เดือน)</h3>
          {transactions.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-muted text-sm gap-3">
              <EmptyChartIllustration className="w-40 h-auto" />
              <p>เพิ่มรายการเพื่อดูกราฟ</p>
              <button
                onClick={() => {
                  seedDemoData();
                  setTransactions(getTransactions());
                }}
                className="flex items-center gap-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition"
              >
                <Database className="w-3.5 h-3.5" />
                โหลดข้อมูลตัวอย่าง
              </button>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">ค่าใช้จ่ายตามหมวดหมู่</h3>
          {expenseData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {expenseData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {expenseData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-muted">{item.name}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted text-sm">
              <EmptyChartIllustration className="w-36 h-auto mb-3" />
              เพิ่มค่าใช้จ่ายเพื่อดูสัดส่วน
            </div>
          )}
        </div>
      </div>

      {/* Recent Clients */}
      {clients.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">ลูกค้ารายได้สูงสุด</h3>
          <div className="space-y-3">
            {clients.slice(0, 5).map((client) => {
              const clientIncome = transactions
                .filter((t) => t.clientId === client.id && t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);
              return (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(clientIncome)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
