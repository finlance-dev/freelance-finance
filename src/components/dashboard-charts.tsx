"use client";

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
import { Database } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EmptyChartIllustration } from "@/components/illustrations";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface DashboardChartsProps {
  monthlyData: { month: string; income: number; expenses: number; profit: number }[];
  expenseData: { name: string; value: number }[];
  clientIncomeData: { name: string; color: string; income: number }[];
  hasTransactions: boolean;
  widgetPrefs: Record<string, boolean>;
  onLoadDemo: () => void;
  t: (section: string, key: string) => string;
}

export default function DashboardCharts({
  monthlyData,
  expenseData,
  clientIncomeData,
  hasTransactions,
  widgetPrefs,
  onLoadDemo,
  t,
}: DashboardChartsProps) {
  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "13px",
  };

  return (
    <>
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Income Trend Area Chart */}
        {widgetPrefs.profitTrend && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">{t("dashboard", "profitTrend")}</h3>
            {hasTransactions ? (
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
        )}

        {/* Monthly Income vs Expenses Bar Chart */}
        {widgetPrefs.incomeVsExpense && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">{t("dashboard", "incomeVsExpense")}</h3>
            {hasTransactions ? (
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
                  onClick={onLoadDemo}
                  className="flex items-center gap-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition"
                >
                  <Database className="w-3.5 h-3.5" />
                  {t("dashboard", "loadDemo")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expense Pie + Client Income */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        {widgetPrefs.expenseByCategory && (
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
        )}

        {/* Income by Client */}
        {widgetPrefs.incomeByClient && clientIncomeData.length > 0 && (
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
  );
}
