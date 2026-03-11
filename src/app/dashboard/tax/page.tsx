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

  if (!mounted) return null;

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ประมาณภาษี</h1>
          <p className="text-muted text-sm mt-1">ประมาณภาษีและวางแผนกระแสเงินสดของคุณ</p>
        </div>

        <UpgradePrompt
          feature="ประมาณภาษี"
          description="ปลดล็อคเครื่องมือวางแผนภาษีที่ออกแบบมาเพื่อฟรีแลนซ์ไทยโดยเฉพาะ ให้คุณรู้ล่วงหน้าว่าต้องเตรียมเงินจ่ายภาษีเท่าไหร่ ไม่ต้องกังวลตอนสิ้นปีอีกต่อไป"
        />

        {/* Feature Preview */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">คำนวณภาษีอัตโนมัติ</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ระบบคำนวณภาษีให้อัตโนมัติจากรายรับที่คุณบันทึก รองรับทั้งอัตราคงที่และขั้นบันไดตามกฎหมายไทย (0-35%) พร้อมหักค่าลดหย่อนส่วนตัว
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-sm">แจ้งเตือนกำหนดจ่ายภาษี</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ไม่พลาดกำหนดยื่นภาษีรายไตรมาส ระบบแจ้งเตือนล่วงหน้า 30 วัน พร้อมบอกยอดที่ต้องเตรียมจ่ายในแต่ละไตรมาส
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-sm">วิเคราะห์กระแสเงินสด</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ดูว่าเงินที่มีอยู่ใช้ได้อีกกี่เดือน (Runway) เปรียบเทียบรายได้กับค่าใช้จ่ายรายเดือน ช่วยให้วางแผนการเงินได้มั่นใจขึ้น
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-5 h-5 text-danger" />
              <h3 className="font-semibold text-sm">คำแนะนำการเงิน</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              แนะนำเงินเดือนที่ควรจ่ายให้ตัวเอง (60% ของรายได้) บอกว่าควรเก็บเงินไว้จ่ายภาษีเท่าไหร่ และเตือนเมื่อเงินสำรองใกล้หมด
            </p>
          </div>
        </div>

        {/* Tax Bracket Preview */}
        <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">อัตราภาษีขั้นบันไดไทยที่ใช้คำนวณ</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TAX_BRACKETS.slice(0, 4).map((b, i) => (
              <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted">
                  {b.max <= 150000 ? "≤150K" : b.max <= 300000 ? "150-300K" : b.max <= 500000 ? "300-500K" : "500-750K"}
                </p>
                <p className="text-lg font-bold text-primary">{b.rate === 0 ? "ยกเว้น" : `${b.rate}%`}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2 text-center">
            อัตรา 20-35% สำหรับรายได้ 750K ขึ้นไป • คำนวณตามอัตราจริงของกรมสรรพากร
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ประมาณภาษี</h1>
          <p className="text-muted text-sm mt-1">ประมาณภาษีและวางแผนกระแสเงินสดของคุณ</p>
        </div>
        {availableYears.length > 1 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                ปี {y} {y === currentYear ? "(ปีนี้)" : ""}
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
              <h3 className="font-semibold text-sm mb-2">เริ่มต้นใช้งานประมาณภาษี</h3>
              <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                <li>ไปที่หน้า <strong>รายรับ-รายจ่าย</strong> แล้วเพิ่มรายการเงินเข้า-ออกของคุณ</li>
                <li>กลับมาที่หน้านี้ ระบบจะคำนวณภาษีให้อัตโนมัติจากข้อมูลที่บันทึก</li>
                <li>ปรับ <strong>วิธีคำนวณ</strong> ได้ตามต้องการ — อัตราคงที่ (เหมาจ่าย) หรือขั้นบันไดตามกฎหมาย</li>
                <li>ใส่ <strong>ค่าใช้จ่ายรายเดือน</strong> เพื่อดูว่าเงินเหลือใช้ได้อีกกี่เดือน</li>
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
            <p className="font-semibold text-warning">ใกล้ถึงกำหนดจ่ายภาษีแล้ว</p>
            <p className="text-sm text-muted mt-1">
              ภาษี {quarters[currentQ].q} ครบกำหนดจ่ายวันที่{" "}
              <strong>{new Date(nextDeadline!).toLocaleDateString("th-TH")}</strong> (อีก {daysUntilDeadline} วัน)
              ยอดประมาณ: <strong>{formatCurrency(analysis.quarterlyTax)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">รายได้สะสม{selectedYear === currentYear ? "ปีนี้" : `ปี ${selectedYear}`}</p>
          <p className="text-2xl font-bold text-accent">{formatCurrency(analysis.yearIncome)}</p>
          <p className="text-xs text-muted mt-1">จากรายรับที่บันทึกไว้ในปี {selectedYear}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">{selectedYear === currentYear ? "ประมาณรายได้ทั้งปี" : "รายได้ทั้งปี"}</p>
          <p className="text-2xl font-bold">{formatCurrency(analysis.projectedAnnual)}</p>
          <p className="text-xs text-muted mt-1">
            {selectedYear === currentYear ? `คาดการณ์จาก ${now.getMonth() + 1} เดือนที่ผ่านมา` : `ข้อมูลจริงทั้งปี ${selectedYear}`}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">ภาษีทั้งปี (ประมาณ)</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(analysis.estimatedAnnualTax)}</p>
          <p className="text-xs text-muted mt-1">
            อัตราขั้นบันได ~{analysis.effectiveRate.toFixed(1)}% • ขั้น {analysis.currentBracket.rate}%
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">ภาษีรายไตรมาส (ประมาณ)</p>
          <p className="text-2xl font-bold text-danger">{formatCurrency(analysis.quarterlyTax)}</p>
          <p className="text-xs text-muted mt-1">ยอดที่ควรเตรียมจ่ายทุก 3 เดือน</p>
        </div>
      </div>

      {/* Auto-calculated info + collapsible settings */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">วิธีการคำนวณ</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition"
          >
            <Settings className="w-3.5 h-3.5" />
            ปรับแต่ง
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">รายได้ที่คาดการณ์ต่อปี</span>
            <span className="font-medium">{formatCurrency(analysis.projectedAnnual)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">หักค่าใช้จ่าย (60%)</span>
            <span className="font-medium text-accent">-{formatCurrency(60000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">หักค่าลดหย่อนส่วนตัว</span>
            <span className="font-medium text-accent">-{formatCurrency(deductions)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted">รายได้สุทธิ (เสียภาษี)</span>
            <span className="font-semibold">{formatCurrency(analysis.taxableIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">อยู่ในขั้นภาษี</span>
            <span className="font-semibold text-primary">
              {analysis.currentBracket.rate === 0 ? "ยกเว้นภาษี" : `${analysis.currentBracket.rate}%`}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted mt-2">
          คำนวณอัตโนมัติตามอัตราภาษีขั้นบันไดของกรมสรรพากร จากรายรับที่คุณบันทึกไว้
        </p>

        {/* Collapsible Settings */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">ค่าลดหย่อน (บาท)</label>
                <input
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted mt-1.5">เช่น ประกันสังคม, กองทุน, ประกันชีวิต (ค่าเริ่มต้น 100,000)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">ค่าใช้จ่ายรายเดือน (บาท)</label>
                <input
                  type="number"
                  value={customMonthlyExpenses ? monthlyExpenses : Math.round(analysis.effectiveMonthlyExpenses)}
                  onChange={(e) => handleMonthlyExpensesChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted mt-1.5">
                  {customMonthlyExpenses
                    ? "คุณกำหนดเอง — ใช้คำนวณ Runway"
                    : `คำนวณจากรายจ่ายจริง (${formatCurrency(analysis.effectiveMonthlyExpenses)}/เดือน)`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quarterly Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">สรุปรายไตรมาส ({selectedYear})</h3>
        {transactions.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.quarterlyData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "income" ? "รายรับ" : name === "expenses" ? "รายจ่าย" : "ภาษี (ประมาณ)",
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
            เพิ่มรายการเพื่อดูสรุปรายไตรมาส
          </div>
        )}
      </div>

      {/* Cash Flow & Recommendations (Pro only) */}
      {isPro ? (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Runway */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">สุขภาพกระแสเงินสด</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">เงินเหลือใช้ได้อีก</span>
                <span className={`font-semibold ${analysis.monthsOfRunway >= 6 ? "text-accent" : analysis.monthsOfRunway >= 3 ? "text-warning" : "text-danger"}`}>
                  {analysis.monthsOfRunway} เดือน
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
                <span className="text-muted">รายได้เฉลี่ย/เดือน</span>
                <span className="font-medium">{formatCurrency(analysis.avgMonthlyIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">ค่าใช้จ่าย/เดือน</span>
                <span className="font-medium">{formatCurrency(analysis.effectiveMonthlyExpenses)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted">เงินเหลือ/เดือน</span>
                <span className={`font-semibold ${analysis.avgMonthlyIncome - analysis.effectiveMonthlyExpenses >= 0 ? "text-accent" : "text-danger"}`}>
                  {formatCurrency(analysis.avgMonthlyIncome - analysis.effectiveMonthlyExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">คำแนะนำ</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">เงินเดือนที่แนะนำ</p>
                <p className="text-sm text-muted">
                  จ่ายให้ตัวเอง <strong>{formatCurrency(analysis.recommendedSalary)}</strong>/เดือน
                  (60% ของรายได้เฉลี่ย) เก็บส่วนที่เหลือไว้สำหรับภาษีและเหตุฉุกเฉิน
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-xl">
              <Calculator className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">เตรียมเงินจ่ายภาษี</p>
                <p className="text-sm text-muted">
                  เก็บเงิน <strong>{formatCurrency(analysis.quarterlyTax)}</strong> ไว้ทุกไตรมาส
                  สำหรับจ่ายภาษี
                </p>
              </div>
            </div>

            {analysis.monthsOfRunway < 3 && (
              <div className="flex items-start gap-3 p-3 bg-danger/5 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">เงินสำรองใกล้หมด</p>
                  <p className="text-sm text-muted">
                    คุณมีเงินสำรองเหลือไม่ถึง 3 เดือน ควรพิจารณาลดค่าใช้จ่ายหรือหาทางเพิ่มรายได้
                  </p>
                </div>
              </div>
            )}

            {analysis.monthsOfRunway >= 6 && (
              <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-xl">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">การเงินแข็งแรง</p>
                  <p className="text-sm text-muted">
                    คุณมีเงินสำรองมากกว่า {analysis.monthsOfRunway} เดือน เยี่ยมมาก!
                    การเงินของคุณมั่นคงดี
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <h3 className="font-semibold mb-2">กระแสเงินสดและคำแนะนำ</h3>
          <UpgradePrompt feature="พยากรณ์กระแสเงินสด" compact />
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
              <h3 className="font-semibold">หัก ณ ที่จ่าย (WHT) สะสม</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">WHT ที่ถูกหักทั้งหมด</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalWHT)}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">ภาษีที่ต้องจ่าย (ประมาณ)</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(analysis.estimatedAnnualTax)}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">ภาษีคงเหลือ / ได้คืน</p>
                <p className={`text-xl font-bold ${analysis.estimatedAnnualTax - totalWHT <= 0 ? "text-accent" : "text-danger"}`}>
                  {analysis.estimatedAnnualTax - totalWHT <= 0 ? "ได้คืน " : "จ่ายเพิ่ม "}
                  {formatCurrency(Math.abs(analysis.estimatedAnnualTax - totalWHT))}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted">จากรายการรายรับที่มี WHT {txWithWHT.length} รายการ</p>
          </div>
        );
      })()}

      {/* ภ.ง.ด.90 Annual Tax Summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">สรุปภาษีประจำปี (แบบ ภ.ง.ด.90)</h3>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">1. เงินได้พึงประเมิน (รายได้รวมปี {selectedYear})</span>
            <span className="font-medium">{formatCurrency(analysis.yearIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">2. หักค่าใช้จ่าย (60% ไม่เกิน 60,000)</span>
            <span className="font-medium text-accent">-{formatCurrency(60000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">3. หักค่าลดหย่อน (ส่วนตัว + อื่นๆ)</span>
            <span className="font-medium text-accent">-{formatCurrency(deductions)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-medium">4. เงินได้สุทธิ</span>
            <span className="font-bold">{formatCurrency(analysis.taxableIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">5. ภาษีที่คำนวณได้ (ขั้นบันได)</span>
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
                  <span className="text-muted">6. หัก ณ ที่จ่ายที่ถูกหักไว้</span>
                  <span className="font-medium text-accent">-{formatCurrency(totalWHT)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-bold">{remaining <= 0 ? "7. ภาษีที่ชำระไว้เกิน (ขอคืน)" : "7. ภาษีที่ต้องชำระเพิ่ม"}</span>
                  <span className={`font-bold text-lg ${remaining <= 0 ? "text-accent" : "text-danger"}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
        <p className="text-xs text-muted mt-3">
          * ตัวเลขเป็นการประมาณ ใช้เป็นแนวทางเตรียมยื่น ภ.ง.ด.90 • ค่าใช้จ่ายหักเหมา 60% (สำหรับฟรีแลนซ์ ม.40(2))
        </p>
      </div>

      {/* Thai Tax Brackets Reference */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">อัตราภาษีเงินได้บุคคลธรรมดา (ขั้นบันได)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-medium">รายได้สุทธิ (บาท)</th>
                <th className="text-right py-2 text-muted font-medium">อัตราภาษี</th>
              </tr>
            </thead>
            <tbody>
              {TAX_BRACKETS.map((bracket, i) => {
                const isCurrentBracket = analysis.currentBracket.min === bracket.min;
                return (
                  <tr key={i} className={`border-b border-border/50 ${isCurrentBracket ? "bg-primary/5" : ""}`}>
                    <td className="py-2 pr-4">
                      {formatCurrency(bracket.min)} - {bracket.max === Infinity ? "ขึ้นไป" : formatCurrency(bracket.max)}
                      {isCurrentBracket && <span className="ml-2 text-xs text-primary font-medium">← คุณอยู่ขั้นนี้</span>}
                    </td>
                    <td className="text-right py-2 font-medium">
                      {bracket.rate === 0 ? "ยกเว้น" : `${bracket.rate}%`}
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
