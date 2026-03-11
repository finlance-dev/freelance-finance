"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Tag,
  DollarSign,
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
import { getTransactions, getClients } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, Client } from "@/lib/types";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePrompt } from "@/components/upgrade-prompt";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function getMonthOptions() {
  const options: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString("th-TH", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return options;
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const { isPro } = usePlan();

  useEffect(() => {
    setTransactions(getTransactions());
    setClients(getClients());
    setMounted(true);
  }, []);

  if (mounted && !isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">รายงาน</h1>
          <p className="text-muted text-sm mt-1">สรุปรายงานรายเดือนอย่างละเอียด</p>
        </div>
        <UpgradePrompt
          feature="รายงานรายเดือน"
          description="ดูสรุปรายรับ-รายจ่าย กราฟหมวดหมู่ และวิเคราะห์รายได้ตามลูกค้า อัปเกรดเป็นโปรเพื่อปลดล็อค"
        />
      </div>
    );
  }

  const selected = monthOptions[selectedIdx];
  const prevMonth = monthOptions[selectedIdx + 1];

  const monthTx = useMemo(() => {
    if (!selected) return [];
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === selected.month && d.getFullYear() === selected.year;
    });
  }, [transactions, selected]);

  const prevMonthTx = useMemo(() => {
    if (!prevMonth) return [];
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === prevMonth.month && d.getFullYear() === prevMonth.year;
    });
  }, [transactions, prevMonth]);

  const stats = useMemo(() => {
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    const profitChange = (prevIncome - prevExpenses) !== 0
      ? (((income - expenses) - (prevIncome - prevExpenses)) / Math.abs(prevIncome - prevExpenses)) * 100
      : 0;

    return { income, expenses, profit: income - expenses, incomeChange, expenseChange, profitChange };
  }, [monthTx, prevMonthTx]);

  const expenseByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => {
      const cat = t.category || "อื่นๆ";
      cats[cat] = (cats[cat] || 0) + t.amount;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTx]);

  const incomeByClient = useMemo(() => {
    const map: Record<string, { name: string; color: string; income: number }> = {};
    monthTx.filter((t) => t.type === "income" && t.clientId).forEach((t) => {
      const client = clients.find((c) => c.id === t.clientId);
      if (client) {
        if (!map[client.id]) map[client.id] = { name: client.name, color: client.color, income: 0 };
        map[client.id].income += t.amount;
      }
    });
    return Object.values(map).sort((a, b) => b.income - a.income);
  }, [monthTx, clients]);

  const topTransactions = useMemo(() => {
    return [...monthTx].sort((a, b) => b.amount - a.amount).slice(0, 10);
  }, [monthTx]);

  if (!mounted) return null;

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "13px",
  };

  function ChangeIndicator({ value }: { value: number }) {
    if (value === 0) return null;
    return (
      <span className={`flex items-center gap-0.5 text-xs font-medium ${value > 0 ? "text-accent" : "text-danger"}`}>
        {value > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(value).toFixed(0)}%
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">รายงานรายเดือน</h1>
          <p className="text-muted text-sm mt-1">สรุปรายรับ-รายจ่ายและกำไรแต่ละเดือน</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted" />
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {monthOptions.map((opt, i) => (
              <option key={i} value={i}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted">รายรับ</span>
            </div>
            <ChangeIndicator value={stats.incomeChange} />
          </div>
          <p className="text-2xl font-bold text-accent">{formatCurrency(stats.income)}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-danger/10 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-danger" />
              </div>
              <span className="text-sm text-muted">รายจ่าย</span>
            </div>
            <ChangeIndicator value={stats.expenseChange} />
          </div>
          <p className="text-2xl font-bold text-danger">{formatCurrency(stats.expenses)}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${stats.profit >= 0 ? "bg-accent/10" : "bg-danger/10"} rounded-xl flex items-center justify-center`}>
                <DollarSign className={`w-4 h-4 ${stats.profit >= 0 ? "text-accent" : "text-danger"}`} />
              </div>
              <span className="text-sm text-muted">กำไรสุทธิ</span>
            </div>
            <ChangeIndicator value={stats.profitChange} />
          </div>
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? "text-accent" : "text-danger"}`}>
            {formatCurrency(stats.profit)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expense by Category Bar */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">รายจ่ายตามหมวดหมู่</h3>
          </div>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseByCategory} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="จำนวน">
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted text-sm">
              ไม่มีรายจ่ายในเดือนนี้
            </div>
          )}
        </div>

        {/* Expense Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-warning" />
            <h3 className="font-semibold">สัดส่วนรายจ่าย</h3>
          </div>
          {expenseByCategory.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value">
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {expenseByCategory.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted truncate">{item.name}</span>
                    <span className="font-medium ml-auto whitespace-nowrap">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">
              ไม่มีข้อมูล
            </div>
          )}
        </div>
      </div>

      {/* Income by Client */}
      {incomeByClient.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">รายได้ตามลูกค้า</h3>
          </div>
          <div className="space-y-3">
            {incomeByClient.map((item, i) => {
              const maxIncome = incomeByClient[0].income;
              const pct = (item.income / maxIncome) * 100;
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
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(item.income)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Transactions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">รายการใหญ่สุดในเดือนนี้</h3>
        </div>
        {topTransactions.length > 0 ? (
          <div className="divide-y divide-border">
            {topTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-card-hover transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tx.type === "income" ? "bg-accent/10" : "bg-danger/10"}`}>
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-accent" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-danger" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{tx.description}</p>
                    <p className="text-xs text-muted">
                      {formatDate(tx.date)}
                      {tx.category && ` · ${tx.category}`}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold whitespace-nowrap text-sm ${tx.type === "income" ? "text-accent" : "text-danger"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted text-sm">
            ไม่มีรายการในเดือนนี้
          </div>
        )}
      </div>
    </div>
  );
}
