"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  FileText,
  BarChart3,
  RefreshCw,
  Calculator,
  UserCircle,
  Settings,
  CreditCard,
  CheckCircle2,
  XCircle,
  Crown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";

interface FeatureDetail {
  icon: React.ElementType;
  title: string;
  href: string;
  freeDescription: string;
  freeAvailable: boolean;
  freeLimit?: string;
  proDescription: string;
  proExtra?: string;
}

const features: FeatureDetail[] = [
  {
    icon: LayoutDashboard,
    title: "ภาพรวม (Dashboard)",
    href: "/dashboard",
    freeAvailable: true,
    freeDescription:
      "ดูสรุปรายรับ-รายจ่ายรวม พร้อมการ์ดสถิติพื้นฐาน 3 ใบ ได้แก่ รายรับเดือนนี้ รายจ่ายเดือนนี้ และยอดคงเหลือ ช่วยให้คุณเห็นภาพรวมทางการเงินอย่างรวดเร็ว",
    freeLimit: "ไม่มีกราฟแนวโน้ม, กราฟหมวดหมู่, เป้าหมายรายได้ และภาษีรายไตรมาส",
    proDescription:
      "ดูสรุปรายรับ-รายจ่ายแบบครบถ้วน พร้อมการ์ดสถิติ 4 ใบ (เพิ่มภาษีรายไตรมาส) กราฟแนวโน้มรายรับ-รายจ่าย 6 เดือน กราฟสัดส่วนหมวดหมู่ เป้าหมายรายได้ที่ตั้งเองได้ และรายการล่าสุดพร้อมลิงก์ไปหน้าอื่น",
  },
  {
    icon: ArrowLeftRight,
    title: "รายการเงิน (Transactions)",
    href: "/dashboard/transactions",
    freeAvailable: true,
    freeDescription:
      "บันทึกรายรับ-รายจ่ายได้สูงสุด 30 รายการ แต่ละรายการระบุจำนวนเงิน วันที่ หมวดหมู่ ลูกค้า และโน้ตได้ พร้อมระบบค้นหาและกรอง ดูยอดรวมรายรับ-รายจ่ายของเดือนนั้น",
    freeLimit: "จำกัด 30 รายการ",
    proDescription:
      "บันทึกรายรับ-รายจ่ายได้ไม่จำกัด พร้อมฟีเจอร์ครบเหมือนแพลนฟรี ไม่ต้องกังวลเรื่องจำนวนรายการ เหมาะกับฟรีแลนซ์ที่มีรายการเยอะ",
    proExtra: "ไม่จำกัดจำนวนรายการ",
  },
  {
    icon: Users,
    title: "ลูกค้าและโปรเจกต์ (Clients & Projects)",
    href: "/dashboard/clients",
    freeAvailable: true,
    freeDescription:
      "จัดการลูกค้าได้สูงสุด 3 ราย บันทึกชื่อ อีเมล เบอร์โทร บริษัท สร้างโปรเจกต์ภายใต้ลูกค้าแต่ละราย กำหนดงบประมาณ วันเริ่ม-วันจบ สถานะโปรเจกต์ และดูรายรับจากลูกค้าแต่ละราย",
    freeLimit: "จำกัด 3 ลูกค้า",
    proDescription:
      "จัดการลูกค้าได้ไม่จำกัด พร้อมฟีเจอร์ครบเหมือนแพลนฟรี เหมาะกับฟรีแลนซ์ที่มีลูกค้าหลายราย จัดการโปรเจกต์ได้อย่างเป็นระบบ",
    proExtra: "ไม่จำกัดจำนวนลูกค้า",
  },
  {
    icon: FileText,
    title: "ใบแจ้งหนี้ (Invoices)",
    href: "/dashboard/invoices",
    freeAvailable: false,
    freeDescription:
      "ฟีเจอร์นี้สำหรับแพลนโปรเท่านั้น อัปเกรดเพื่อสร้างใบแจ้งหนี้แบบมืออาชีพ พร้อม PromptPay QR Code ส่งให้ลูกค้าชำระเงินได้ทันที",
    proDescription:
      "สร้างใบแจ้งหนี้แบบมืออาชีพ เลือกลูกค้าและโปรเจกต์ เพิ่มรายการสินค้า/บริการ ระบบคำนวณยอดรวมอัตโนมัติ ดาวน์โหลดเป็นไฟล์ HTML/PDF พร้อม PromptPay QR Code ติดตามสถานะใบแจ้งหนี้ (แบบร่าง, ส่งแล้ว, ชำระแล้ว, เลยกำหนด) แสดงข้อมูลธุรกิจและบัญชีธนาคารจากโปรไฟล์อัตโนมัติ",
    proExtra: "พร้อม PromptPay QR และข้อมูลธนาคาร",
  },
  {
    icon: BarChart3,
    title: "รายงาน (Reports)",
    href: "/dashboard/reports",
    freeAvailable: false,
    freeDescription:
      "ฟีเจอร์นี้สำหรับแพลนโปรเท่านั้น อัปเกรดเพื่อดูรายงานสรุปรายเดือน กราฟวิเคราะห์ และรายได้ตามลูกค้า",
    proDescription:
      "ดูรายงานสรุปรายเดือนแบบละเอียด ประกอบด้วย สรุปรายรับ-รายจ่าย-กำไรสุทธิรายเดือน กราฟแท่งเปรียบเทียบรายรับ-รายจ่ายรายเดือน กราฟวงกลมสัดส่วนหมวดหมู่ค่าใช้จ่าย รายได้แยกตามลูกค้า และรายการธุรกรรมมูลค่าสูงสุด",
  },
  {
    icon: RefreshCw,
    title: "รายการประจำ (Recurring)",
    href: "/dashboard/recurring",
    freeAvailable: false,
    freeDescription:
      "ฟีเจอร์นี้สำหรับแพลนโปรเท่านั้น อัปเกรดเพื่อตั้งค่ารายรับ-รายจ่ายอัตโนมัติ ไม่ต้องบันทึกซ้ำทุกเดือน",
    proDescription:
      "ตั้งค่ารายการรายรับ-รายจ่ายที่เกิดขึ้นประจำ เช่น ค่าเช่า ค่าบริการรายเดือน เงินเดือนจากลูกค้า เลือกความถี่ (รายสัปดาห์, รายเดือน, รายปี) ระบบจะสร้างรายการให้อัตโนมัติ พร้อมหยุดชั่วคราวหรือแก้ไขได้ตลอดเวลา",
  },
  {
    icon: Calculator,
    title: "ประมาณภาษี (Tax Estimator)",
    href: "/dashboard/tax",
    freeAvailable: false,
    freeDescription:
      "ฟีเจอร์นี้สำหรับแพลนโปรเท่านั้น อัปเกรดเพื่อคำนวณภาษีเงินได้โดยประมาณตามอัตราก้าวหน้า พร้อมวางแผนภาษีล่วงหน้า",
    proDescription:
      "คำนวณภาษีเงินได้บุคคลธรรมดาโดยประมาณ ใช้อัตราภาษีก้าวหน้าของประเทศไทย (5%-35%) หักค่าใช้จ่ายและค่าลดหย่อนส่วนตัว 60,000 บาท แสดงตารางขั้นบันไดภาษี แผนภูมิสัดส่วน และแนะนำการวางแผนภาษีเบื้องต้น",
  },
  {
    icon: UserCircle,
    title: "โปรไฟล์ (Profile)",
    href: "/dashboard/profile",
    freeAvailable: false,
    freeDescription:
      "ฟีเจอร์นี้สำหรับแพลนโปรเท่านั้น อัปเกรดเพื่อจัดการข้อมูลส่วนตัว ข้อมูลธุรกิจ และบัญชีธนาคาร ที่จะแสดงในใบแจ้งหนี้",
    proDescription:
      "จัดการข้อมูลส่วนตัวครบถ้วน ได้แก่ ชื่อ อีเมล เบอร์โทร เว็บไซต์ แนะนำตัว และอัปโหลดรูปโปรไฟล์ ข้อมูลธุรกิจ ได้แก่ ชื่อธุรกิจ เลขประจำตัวผู้เสียภาษี ที่อยู่ และบัญชีธนาคาร (เลือกจาก 10 ธนาคารไทย) ข้อมูลเหล่านี้จะแสดงในใบแจ้งหนี้อัตโนมัติ",
  },
  {
    icon: Settings,
    title: "ตั้งค่า (Settings)",
    href: "/dashboard/settings",
    freeAvailable: true,
    freeDescription:
      "ตั้งค่าพื้นฐานของแอป เช่น ธีมสี (สว่าง/มืด/ตามระบบ) และดูข้อมูลทั่วไป ฟีเจอร์ PromptPay QR, Line Notify แจ้งเตือน และสำรอง/กู้คืนข้อมูล สำหรับแพลนโปรเท่านั้น",
    freeLimit: "PromptPay QR, Line Notify, สำรองข้อมูล ล็อคสำหรับโปร",
    proDescription:
      "ตั้งค่าครบถ้วน PromptPay QR Code ใส่เลขพร้อมเพย์เพื่อแสดงในใบแจ้งหนี้ Line Notify แจ้งเตือนรายรับ-รายจ่ายผ่านไลน์อัตโนมัติ Cloud Sync ซิงก์ข้อมูลกับ Supabase และสำรอง/กู้คืนข้อมูลทั้งหมด",
    proExtra: "PromptPay QR + Line Notify + Cloud + Backup",
  },
  {
    icon: CreditCard,
    title: "แพลนและราคา (Pricing)",
    href: "/dashboard/pricing",
    freeAvailable: true,
    freeDescription:
      "ดูรายละเอียดแพลนทั้งหมด เปรียบเทียบฟีเจอร์ระหว่างแพลนฟรีและแพลนโปร พร้อมอัปเกรดได้ทันที",
    proDescription:
      "ดูรายละเอียดแพลนปัจจุบัน และจัดการการสมัครสมาชิกของคุณ",
  },
];

function FeatureCard({ feature, mode }: { feature: FeatureDetail; mode: "free" | "pro" }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = feature.icon;

  const isFree = mode === "free";
  const available = isFree ? feature.freeAvailable : true;
  const description = isFree ? feature.freeDescription : feature.proDescription;

  return (
    <div
      className={cn(
        "bg-card border rounded-2xl overflow-hidden transition-all",
        available ? "border-border" : "border-border opacity-70"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-card-hover transition"
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            available
              ? isFree
                ? "bg-primary/10 text-primary"
                : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
              : "bg-secondary text-muted"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{feature.title}</span>
            {available ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-muted shrink-0" />
            )}
          </div>
          {isFree && feature.freeLimit && (
            <p className="text-xs text-warning mt-0.5">{feature.freeLimit}</p>
          )}
          {!isFree && feature.proExtra && (
            <p className="text-xs text-primary mt-0.5">{feature.proExtra}</p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <p className="text-sm text-muted leading-relaxed mt-3">{description}</p>
          {available && (
            <Link
              href={feature.href}
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary font-medium hover:underline"
            >
              ไปที่หน้านี้ →
            </Link>
          )}
          {!available && isFree && (
            <Link
              href="/dashboard/pricing"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary font-medium hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              อัปเกรดเป็นโปร
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<"free" | "pro">("free");
  const { isPro, mounted } = usePlan();

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 bg-secondary rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const freeFeatures = features.filter((f) => f.freeAvailable);
  const lockedFeatures = features.filter((f) => !f.freeAvailable);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">คู่มือใช้งาน</h1>
        </div>
        <p className="text-muted text-sm mt-1">
          เรียนรู้ฟีเจอร์ทั้งหมดของ FreelanceFlow กดที่แต่ละฟีเจอร์เพื่อดูรายละเอียด
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-secondary rounded-xl p-1 max-w-md">
        <button
          onClick={() => setActiveTab("free")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition",
            activeTab === "free"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          <Zap className="w-4 h-4" />
          แพลนฟรี
        </button>
        <button
          onClick={() => setActiveTab("pro")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition",
            activeTab === "pro"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          <Crown className="w-4 h-4" />
          แพลนโปร
        </button>
      </div>

      {/* Free Plan Tab */}
      {activeTab === "free" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-secondary to-secondary/50 border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="font-bold">แพลนฟรี — เริ่มต้นใช้งานได้เลย</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              เหมาะสำหรับฟรีแลนซ์มือใหม่ที่เพิ่งเริ่มติดตามรายรับ-รายจ่าย ใช้ฟีเจอร์พื้นฐานได้ฟรีตลอดไป
              ไม่ต้องใส่บัตรเครดิต ไม่มีค่าใช้จ่ายแอบแฝง
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="bg-card border border-border px-3 py-1 rounded-full">ลูกค้าสูงสุด 3 ราย</span>
              <span className="bg-card border border-border px-3 py-1 rounded-full">รายการสูงสุด 30 รายการ</span>
              <span className="bg-card border border-border px-3 py-1 rounded-full">ฟรีตลอดไป</span>
            </div>
          </div>

          {/* Available Features */}
          <div>
            <h3 className="text-sm font-semibold text-accent flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              ฟีเจอร์ที่ใช้ได้ ({freeFeatures.length} ฟีเจอร์)
            </h3>
            <div className="space-y-2">
              {freeFeatures.map((f) => (
                <FeatureCard key={f.title} feature={f} mode="free" />
              ))}
            </div>
          </div>

          {/* Locked Features */}
          <div>
            <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4" />
              ฟีเจอร์ที่ต้องอัปเกรด ({lockedFeatures.length} ฟีเจอร์)
            </h3>
            <div className="space-y-2">
              {lockedFeatures.map((f) => (
                <FeatureCard key={f.title} feature={f} mode="free" />
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isPro && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-bold mb-1">ปลดล็อคทุกฟีเจอร์</h3>
              <p className="text-sm text-muted mb-4">
                อัปเกรดเป็นโปรเพื่อใช้ฟีเจอร์ทั้งหมดแบบไม่จำกัด เริ่มต้นเพียง ฿299/เดือน
              </p>
              <Link
                href="/dashboard/pricing"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                <Crown className="w-4 h-4" />
                ดูแพลนทั้งหมด
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pro Plan Tab */}
      {activeTab === "pro" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-primary" />
              <h2 className="font-bold">แพลนโปร — เครื่องมือครบครัน</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              ปลดล็อคทุกฟีเจอร์ ไม่จำกัดจำนวนลูกค้า รายการ และใบแจ้งหนี้
              พร้อมรายงานวิเคราะห์ ประมาณภาษี รายการประจำอัตโนมัติ และอีกมากมาย
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="bg-card border border-primary/20 text-primary px-3 py-1 rounded-full">ลูกค้าไม่จำกัด</span>
              <span className="bg-card border border-primary/20 text-primary px-3 py-1 rounded-full">รายการไม่จำกัด</span>
              <span className="bg-card border border-primary/20 text-primary px-3 py-1 rounded-full">฿299/เดือน หรือ ฿2,499/ปี</span>
            </div>
          </div>

          {/* All Features */}
          <div>
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              ฟีเจอร์ทั้งหมด ({features.length} ฟีเจอร์)
            </h3>
            <div className="space-y-2">
              {features.map((f) => (
                <FeatureCard key={f.title} feature={f} mode="pro" />
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isPro && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-bold mb-1">พร้อมอัปเกรดแล้วหรือยัง?</h3>
              <p className="text-sm text-muted mb-4">
                เริ่มต้นเพียง ฿299/เดือน หรือประหยัดกว่าด้วยแพลนรายปี ฿2,499/ปี (ประหยัด 30%)
              </p>
              <Link
                href="/dashboard/pricing"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                <Crown className="w-4 h-4" />
                อัปเกรดเลย
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
