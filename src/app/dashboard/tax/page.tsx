"use client";

import { useState, useEffect, useMemo } from "react";
import { Calculator, AlertTriangle, Check, Info, HelpCircle, TrendingUp, Calendar, PiggyBank, Shield, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  getTransactions,
  getMonthlyExpenses,
  setMonthlyExpenses as saveMonthlyExpenses,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { TaxIllustration } from "@/components/illustrations";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useLocale } from "@/hooks/useLocale";

// Thai personal income tax brackets (simplified)
const TAX_BRACKETS = [
  { min: 0, max: 150000, rate: 0 },
  { min: 150000, max: 300000, rate: 5 },
  { min: 300000, max: 500000, rate: 10 },
  { min: 500000, max: 750000, rate: 15 },
  { min: 750000, max: 1000000, rate: 20 },
  { min: 1000000, max: 2000000, rate: 25 },
  { min: 2000000, max: 5000000, rate: 30 },
  { min: 5000000, max: Infinity, rate: 35 },
];

function calculateThaiTax(annualIncome: number, deductions: number = 100000): number {
  const taxableIncome = Math.max(0, annualIncome - deductions - 60000); // 60k personal deduction
  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of TAX_BRACKETS) {
    const bracketSize = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketSize);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * (bracket.rate / 100);
    remaining -= taxableInBracket;
  }

  return tax;
}

function getQuarterDates(year: number) {
  return [
    { q: "Q1", start: `${year}-01-01`, end: `${year}-03-31`, deadline: `${year}-04-07` },
    { q: "Q2", start: `${year}-04-01`, end: `${year}-06-30`, deadline: `${year}-07-07` },
    { q: "Q3", start: `${year}-07-01`, end: `${year}-09-30`, deadline: `${year}-10-07` },
    { q: "Q4", start: `${year}-10-01`, end: `${year}-12-31`, deadline: `${year + 1}-03-31` },
  ];
}

export default function TaxEstimatorPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [customMonthlyExpenses, setCustomMonthlyExpenses] = useState(false);
  const [deductions, setDeductions] = useState(100000);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [mounted, setMounted] = useState(false);
  const { isPro } = usePlan();
  const { locale, t } = useLocale();

  useEffect(() => {
    const txs = getTransactions();
    setTransactions(txs);
    const saved = getMonthlyExpenses();
    if (saved > 0) {
      setMonthlyExpenses(saved);
      setCustomMonthlyExpenses(true);
    }
    // Auto-select year that has the most data
    if (txs.length > 0) {
      const yearCounts: Record<number, number> = {};
      txs.forEach((t) => {
        const y = new Date(t.date).getFullYear();
        yearCounts[y] = (yearCounts[y] || 0) + 1;
      });
      const bestYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
      if (bestYear) setSelectedYear(Number(bestYear[0]));
    }
    setMounted(true);
  }, []);

  const handleMonthlyExpensesChange = (amount: number) => {
    setMonthlyExpenses(amount);
    setCustomMonthlyExpenses(true);
    saveMonthlyExpenses(amount);
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const quarters = getQuarterDates(selectedYear);
  const dateFmtLocale = locale === "th" ? "th-TH" : "en-US";

  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    transactions.forEach((t) => years.add(new Date(t.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  const analysis = useMemo(() => {
    const yearIncome = transactions
      .filter((t) => t.type === "income" && new Date(t.date).getFullYear() === selectedYear)
      .reduce((s, t) => s + t.amount, 0);

    const yearExpenses = transactions
      .filter((t) => t.type === "expense" && new Date(t.date).getFullYear() === selectedYear)
      .reduce((s, t) => s + t.amount, 0);

    // For past years use 12 months, for current year use months elapsed
    const isCurrentYear = selectedYear === currentYear;
    const monthsElapsed = isCurrentYear ? Math.max(1, now.getMonth() + 1) : 12;
    const projectedAnnual = isCurrentYear ? (yearIncome / monthsElapsed) * 12 : yearIncome;

    // Auto-calculate monthly expenses from actual data if not custom
    const autoMonthlyExpenses = yearExpenses / monthsElapsed;
    const effectiveMonthlyExpenses = customMonthlyExpenses ? monthlyExpenses : autoMonthlyExpenses;

    // Always use Thai bracket calculation (auto)
    const estimatedAnnualTax = calculateThaiTax(projectedAnnual, deductions);
    const quarterlyTax = estimatedAnnualTax / 4;

    // Find which bracket user falls into
    const taxableIncome = Math.max(0, projectedAnnual - deductions - 60000);
    const currentBracket = TAX_BRACKETS.find((b) => taxableIncome >= b.min && taxableIncome < b.max) || TAX_BRACKETS[0];
    const effectiveRate = projectedAnnual > 0 ? (estimatedAnnualTax / projectedAnnual) * 100 : 0;

    // Quarterly breakdown
    const quarterlyData = quarters.map((q) => {
      const qIncome = transactions
        .filter(
          (t) =>
            t.type === "income" &&
            t.date >= q.start &&
            t.date <= q.end
        )
        .reduce((s, t) => s + t.amount, 0);
      const qExpenses = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.date >= q.start &&
            t.date <= q.end
        )
        .reduce((s, t) => s + t.amount, 0);

      return {
        name: q.q,
        income: qIncome,
        expenses: qExpenses,
        tax: quarterlyTax,
        deadline: q.deadline,
      };
    });

    // Cash flow forecast
    const netProfit = yearIncome - yearExpenses;
    const monthsOfRunway =
      effectiveMonthlyExpenses > 0 ? Math.floor(netProfit / effectiveMonthlyExpenses) : 0;

    // Recommended "salary"
    const avgMonthlyIncome = yearIncome / monthsElapsed;
    const recommendedSalary = avgMonthlyIncome * 0.6;

    return {
      yearIncome,
      yearExpenses,
      projectedAnnual,
      estimatedAnnualTax,
      quarterlyTax,
      quarterlyData,
      monthsOfRunway: Math.max(0, monthsOfRunway),
      recommendedSalary,
      avgMonthlyIncome,
      effectiveMonthlyExpenses,
      currentBracket,
      effectiveRate,
      taxableIncome,
    };
  }, [transactions, deductions, customMonthlyExpenses, monthlyExpenses, selectedYear, currentYear, quarters, now]);

  // Current quarter
  const currentQ = Math.floor(now.getMonth() / 3);
  const currentQuarter = analysis.quarterlyData[currentQ];
  const nextDeadline = currentQuarter?.deadline;
  const daysUntilDeadline = nextDeadline
    ? Math.ceil((new Date(nextDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!mounted) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-secondary rounded-xl" />
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-secondary rounded-2xl" />)}
      </div>
      <div className="h-64 bg-secondary rounded-2xl" />
    </div>
  );

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("tax", "title")}</h1>
          <p className="text-muted text-sm mt-1">{t("tax", "subtitle")}</p>
        </div>

        <UpgradePrompt
          feature={t("tax", "upgradeFeature")}
          description={t("tax", "upgradeDesc")}
        />

        {/* Feature Preview */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">{t("tax", "previewAutoCalc")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("tax", "previewAutoCalcDesc")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-sm">{t("tax", "previewDeadline")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("tax", "previewDeadlineDesc")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-sm">{t("tax", "previewCashFlow")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("tax", "previewCashFlowDesc")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-5 h-5 text-danger" />
              <h3 className="font-semibold text-sm">{t("tax", "previewAdvice")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("tax", "previewAdviceDesc")}
            </p>
          </div>
        </div>

        {/* Tax Bracket Preview */}
        <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">{t("tax", "previewBrackets")}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TAX_BRACKETS.slice(0, 4).map((b, i) => (
              <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted">
                  {b.max <= 150000 ? "≤150K" : b.max <= 300000 ? "150-300K" : b.max <= 500000 ? "300-500K" : "500-750K"}
                </p>
                <p className="text-lg font-bold text-primary">{b.rate === 0 ? t("tax", "exempt") : `${b.rate}%`}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2 text-center">
            {t("tax", "previewBracketsNote")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("tax", "title")}</h1>
          <p className="text-muted text-sm mt-1">{t("tax", "subtitle")}</p>
        </div>
        {availableYears.length > 1 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {t("tax", "yearLabel")} {y} {y === currentYear ? t("tax", "thisYear") : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* How It Works Guide */}
      {transactions.length === 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-2">{t("tax", "gettingStarted")}</h3>
              <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                <li>{t("tax", "step1")} <strong>{t("tax", "step1Page")}</strong> {t("tax", "step1Desc")}</li>
                <li>{t("tax", "step2")}</li>
                <li>{t("tax", "step3")} <strong>{t("tax", "step3Method")}</strong> {t("tax", "step3Desc")}</li>
                <li>{t("tax", "step4")} <strong>{t("tax", "step4Expenses")}</strong> {t("tax", "step4Desc")}</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tax Alert */}
      {selectedYear === currentYear && daysUntilDeadline > 0 && daysUntilDeadline <= 30 && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-warning">{t("tax", "taxDeadlineAlert")}</p>
            <p className="text-sm text-muted mt-1">
              {t("tax", "taxQuarter")} {quarters[currentQ].q} {t("tax", "dueOn")}{" "}
              <strong>{new Date(nextDeadline!).toLocaleDateString(dateFmtLocale)}</strong> ({t("tax", "moredays")} {daysUntilDeadline} {t("tax", "daysLeft")})
              {" "}{t("tax", "estAmount")} <strong>{formatCurrency(analysis.quarterlyTax)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">{t("tax", "accumulatedIncome")}{selectedYear === currentYear ? t("tax", "thisYear") : ` ${t("tax", "yearLabel")} ${selectedYear}`}</p>
          <p className="text-2xl font-bold text-accent">{formatCurrency(analysis.yearIncome)}</p>
          <p className="text-xs text-muted mt-1">{t("tax", "fromRecorded")} {selectedYear}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">{selectedYear === currentYear ? t("tax", "projectedAnnual") : t("tax", "actualAnnual")}</p>
          <p className="text-2xl font-bold">{formatCurrency(analysis.projectedAnnual)}</p>
          <p className="text-xs text-muted mt-1">
            {selectedYear === currentYear ? `${t("tax", "projectedFrom")} ${now.getMonth() + 1} ${t("tax", "monthsPassed")}` : `${t("tax", "actualData")} ${selectedYear}`}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">{t("tax", "annualTax")}</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(analysis.estimatedAnnualTax)}</p>
          <p className="text-xs text-muted mt-1">
            {t("tax", "bracketRate")} ~{analysis.effectiveRate.toFixed(1)}% • {t("tax", "bracket")} {analysis.currentBracket.rate}%
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">{t("tax", "quarterlyTax")}</p>
          <p className="text-2xl font-bold text-danger">{formatCurrency(analysis.quarterlyTax)}</p>
          <p className="text-xs text-muted mt-1">{t("tax", "prepareQuarterly")}</p>
        </div>
      </div>

      {/* Auto-calculated info + collapsible settings */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">{t("tax", "calculationMethod")}</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition"
          >
            <Settings className="w-3.5 h-3.5" />
            {t("tax", "customize")}
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">{t("tax", "projectedIncome")}</span>
            <span className="font-medium">{formatCurrency(analysis.projectedAnnual)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t("tax", "deduct60pct")}</span>
            <span className="font-medium text-accent">-{formatCurrency(60000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t("tax", "personalDeduction")}</span>
            <span className="font-medium text-accent">-{formatCurrency(deductions)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted">{t("tax", "taxableIncome")}</span>
            <span className="font-semibold">{formatCurrency(analysis.taxableIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t("tax", "inBracket")}</span>
            <span className="font-semibold text-primary">
              {analysis.currentBracket.rate === 0 ? t("tax", "exempt") : `${analysis.currentBracket.rate}%`}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted mt-2">
          {t("tax", "autoCalcNote")}
        </p>

        {/* Collapsible Settings */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("tax", "deductions")}</label>
                <input
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted mt-1.5">{t("tax", "deductionsHint")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("tax", "monthlyExpenses")}</label>
                <input
                  type="number"
                  value={customMonthlyExpenses ? monthlyExpenses : Math.round(analysis.effectiveMonthlyExpenses)}
                  onChange={(e) => handleMonthlyExpensesChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted mt-1.5">
                  {customMonthlyExpenses
                    ? t("tax", "customExpenses")
                    : `${t("tax", "autoExpenses")} (${formatCurrency(analysis.effectiveMonthlyExpenses)}${t("tax", "perMonth")})`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quarterly Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">{t("tax", "quarterlySummary")} ({selectedYear})</h3>
        {transactions.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.quarterlyData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "income" ? t("tax", "tooltipIncome") : name === "expenses" ? t("tax", "tooltipExpenses") : t("tax", "tooltipTax"),
                ]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tax" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted text-sm">
            <TaxIllustration className="w-40 h-auto mb-3" />
            {t("tax", "addToSeeChart")}
          </div>
        )}
      </div>

      {/* Cash Flow & Recommendations (Pro only) */}
      {isPro ? (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Runway */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">{t("tax", "cashFlowHealth")}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">{t("tax", "runwayLeft")}</span>
                <span className={`font-semibold ${analysis.monthsOfRunway >= 6 ? "text-accent" : analysis.monthsOfRunway >= 3 ? "text-warning" : "text-danger"}`}>
                  {analysis.monthsOfRunway} {t("common", "month")}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    analysis.monthsOfRunway >= 6 ? "bg-accent" : analysis.monthsOfRunway >= 3 ? "bg-warning" : "bg-danger"
                  }`}
                  style={{ width: `${Math.min(100, (analysis.monthsOfRunway / 12) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("tax", "avgMonthlyIncome")}</span>
                <span className="font-medium">{formatCurrency(analysis.avgMonthlyIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("tax", "monthlyExpensesLabel")}</span>
                <span className="font-medium">{formatCurrency(analysis.effectiveMonthlyExpenses)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted">{t("tax", "remaining")}</span>
                <span className={`font-semibold ${analysis.avgMonthlyIncome - analysis.effectiveMonthlyExpenses >= 0 ? "text-accent" : "text-danger"}`}>
                  {formatCurrency(analysis.avgMonthlyIncome - analysis.effectiveMonthlyExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">{t("tax", "recommendations")}</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("tax", "recommendedSalary")}</p>
                <p className="text-sm text-muted">
                  {t("tax", "recommendedSalaryDesc")} <strong>{formatCurrency(analysis.recommendedSalary)}</strong>{t("tax", "perMonth")}
                  {" "}{t("tax", "recommendedSalaryNote")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-xl">
              <Calculator className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("tax", "prepareTax")}</p>
                <p className="text-sm text-muted">
                  {t("tax", "prepareTaxDesc")} <strong>{formatCurrency(analysis.quarterlyTax)}</strong> {t("tax", "prepareTaxNote")}
                </p>
              </div>
            </div>

            {analysis.monthsOfRunway < 3 && (
              <div className="flex items-start gap-3 p-3 bg-danger/5 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("tax", "lowRunway")}</p>
                  <p className="text-sm text-muted">
                    {t("tax", "lowRunwayDesc")}
                  </p>
                </div>
              </div>
            )}

            {analysis.monthsOfRunway >= 6 && (
              <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-xl">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("tax", "healthyFinances")}</p>
                  <p className="text-sm text-muted">
                    {t("tax", "healthyFinancesDesc1")} {analysis.monthsOfRunway} {t("tax", "healthyFinancesDesc2")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <h3 className="font-semibold mb-2">{t("tax", "cashFlowUpgrade")}</h3>
          <UpgradePrompt feature={t("tax", "cashFlowUpgradeFeature")} compact />
        </div>
      )}

      {/* WHT Summary */}
      {(() => {
        const yearTxs = transactions.filter(
          (t) => t.type === "income" && new Date(t.date).getFullYear() === selectedYear
        );
        const totalWHT = yearTxs.reduce((s, t) => s + (t.withholdingTax || 0), 0);
        const txWithWHT = yearTxs.filter((t) => t.withholdingTax && t.withholdingTax > 0);
        if (totalWHT <= 0) return null;
        return (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("tax", "whtSummary")}</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">{t("tax", "totalWHT")}</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalWHT)}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">{t("tax", "taxToPay")}</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(analysis.estimatedAnnualTax)}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">{t("tax", "taxRemaining")}</p>
                <p className={`text-xl font-bold ${analysis.estimatedAnnualTax - totalWHT <= 0 ? "text-accent" : "text-danger"}`}>
                  {analysis.estimatedAnnualTax - totalWHT <= 0 ? `${t("tax", "refund")} ` : `${t("tax", "payMore")} `}
                  {formatCurrency(Math.abs(analysis.estimatedAnnualTax - totalWHT))}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted">{t("tax", "fromWHTEntries")} {txWithWHT.length} {t("tax", "entries")}</p>
          </div>
        );
      })()}

      {/* Annual Tax Summary (PND 90) */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">{t("tax", "annualSummary")}</h3>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">1. {t("tax", "assessableIncome")} {selectedYear})</span>
            <span className="font-medium">{formatCurrency(analysis.yearIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">2. {t("tax", "deductExpense60")}</span>
            <span className="font-medium text-accent">-{formatCurrency(60000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">3. {t("tax", "deductPersonal")}</span>
            <span className="font-medium text-accent">-{formatCurrency(deductions)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-medium">4. {t("tax", "netTaxableIncome")}</span>
            <span className="font-bold">{formatCurrency(analysis.taxableIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">5. {t("tax", "calculatedTax")}</span>
            <span className="font-bold text-warning">{formatCurrency(analysis.estimatedAnnualTax)}</span>
          </div>
          {(() => {
            const totalWHT = transactions
              .filter((t) => t.type === "income" && new Date(t.date).getFullYear() === selectedYear)
              .reduce((s, t) => s + (t.withholdingTax || 0), 0);
            const remaining = analysis.estimatedAnnualTax - totalWHT;
            return (
              <>
                <div className="flex justify-between">
                  <span className="text-muted">6. {t("tax", "whtDeducted")}</span>
                  <span className="font-medium text-accent">-{formatCurrency(totalWHT)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-bold">{remaining <= 0 ? `7. ${t("tax", "overpaid")}` : `7. ${t("tax", "underpaid")}`}</span>
                  <span className={`font-bold text-lg ${remaining <= 0 ? "text-accent" : "text-danger"}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
        <p className="text-xs text-muted mt-3">
          {t("tax", "disclaimer")}
        </p>
      </div>

      {/* Thai Tax Brackets Reference */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">{t("tax", "bracketTable")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-medium">{t("tax", "bracketIncome")}</th>
                <th className="text-right py-2 text-muted font-medium">{t("tax", "bracketRateCol")}</th>
              </tr>
            </thead>
            <tbody>
              {TAX_BRACKETS.map((bracket, i) => {
                const isCurrentBracket = analysis.currentBracket.min === bracket.min;
                return (
                  <tr key={i} className={`border-b border-border/50 ${isCurrentBracket ? "bg-primary/5" : ""}`}>
                    <td className="py-2 pr-4">
                      {formatCurrency(bracket.min)} - {bracket.max === Infinity ? t("tax", "andAbove") : formatCurrency(bracket.max)}
                      {isCurrentBracket && <span className="ml-2 text-xs text-primary font-medium">{t("tax", "yourBracket")}</span>}
                    </td>
                    <td className="text-right py-2 font-medium">
                      {bracket.rate === 0 ? t("tax", "exempt") : `${bracket.rate}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
