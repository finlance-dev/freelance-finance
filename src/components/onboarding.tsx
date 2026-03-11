"use client";

import { useState } from "react";
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  X,
  Users,
  ArrowLeftRight,
  LayoutDashboard,
  Zap,
  FileText,
  Calculator,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}

const steps = [
  {
    id: "welcome",
    icon: DollarSign,
    iconBg: "bg-gradient-to-br from-primary to-purple-500",
    title: "ยินดีต้อนรับสู่ FreelanceFlow!",
    subtitle: "เครื่องมือจัดการการเงินสำหรับฟรีแลนซ์ไทย",
    content: (
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        <p>
          FreelanceFlow ช่วยให้คุณติดตามรายรับ-รายจ่าย จัดการลูกค้าและโปรเจกต์
          สร้างใบแจ้งหนี้ และวิเคราะห์การเงินได้ง่ายๆ ในที่เดียว
        </p>
        <p>
          ข้อมูลทั้งหมดถูกเก็บในเบราว์เซอร์ของคุณ ปลอดภัย ไม่ส่งไปที่ไหน
        </p>
      </div>
    ),
  },
  {
    id: "quickstart",
    icon: Zap,
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    title: "เริ่มต้นใช้งาน",
    subtitle: "3 ขั้นตอนง่ายๆ เพื่อเริ่มติดตามการเงิน",
    content: (
      <div className="space-y-3">
        {[
          { icon: Users, color: "text-primary bg-primary/10", label: "เพิ่มลูกค้ารายแรก", desc: "ไปที่เมนู \"ลูกค้าและโปรเจกต์\" เพิ่มชื่อ อีเมล และสร้างโปรเจกต์" },
          { icon: ArrowLeftRight, color: "text-accent bg-accent/10", label: "บันทึกรายรับ-รายจ่าย", desc: "ไปที่ \"รายการเงิน\" บันทึกทุกรายการ ระบบจะสรุปให้อัตโนมัติ" },
          { icon: LayoutDashboard, color: "text-purple-500 bg-purple-500/10", label: "ดูภาพรวมที่แดชบอร์ด", desc: "กลับมาที่หน้าหลัก ดูสรุปรายรับ-รายจ่าย กราฟ และเป้าหมาย" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-secondary/50 rounded-xl p-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{`${i + 1}. ${item.label}`}</p>
              <p className="text-xs text-muted mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "plans",
    icon: Crown,
    iconBg: "bg-gradient-to-br from-primary to-indigo-600",
    title: "แพลนฟรี vs โปร",
    subtitle: "เลือกแพลนที่เหมาะกับคุณ",
    content: (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs font-semibold text-muted mb-2">แพลนฟรี</p>
          {[
            "รายการเงิน 30 รายการ",
            "ลูกค้าสูงสุด 3 ราย",
            "แดชบอร์ดพื้นฐาน",
            "ธีมสว่าง/มืด",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <div className="w-1 h-1 bg-muted rounded-full" />
              {f}
            </div>
          ))}
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-primary mb-2">แพลนโปร</p>
          {[
            { icon: ArrowLeftRight, label: "รายการไม่จำกัด" },
            { icon: Users, label: "ลูกค้าไม่จำกัด" },
            { icon: FileText, label: "ใบแจ้งหนี้ + QR" },
            { icon: BarChart3, label: "รายงาน + ภาษี" },
            { icon: Calculator, label: "ประมาณภาษี" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-primary mb-1">
              <f.icon className="w-3 h-3" />
              {f.label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "trial",
    icon: Sparkles,
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    title: "ทดลองใช้โปรฟรี 3 วัน!",
    subtitle: "ปลดล็อคทุกฟีเจอร์ ไม่ต้องใส่บัตร",
    content: (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-4 text-center">
          <Crown className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold mb-1">ทดลองใช้แพลนโปรฟรี 3 วัน</p>
          <p className="text-xs text-muted">
            ใช้งานทุกฟีเจอร์ได้เต็มที่ ไม่จำกัด ไม่ต้องผูกบัตรเครดิต
            หลังหมดทดลองจะกลับเป็นแพลนฟรีอัตโนมัติ
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {["ใบแจ้งหนี้", "รายงานวิเคราะห์", "ประมาณภาษี", "รายการประจำ", "โปรไฟล์ธุรกิจ", "PromptPay QR"].map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-foreground">
              <Sparkles className="w-3 h-3 text-primary" />
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function OnboardingModal({ isOpen, onClose, onStartTrial }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const Icon = current.icon;

  const handleClose = () => {
    localStorage.setItem("ff_onboarding_done", "true");
    onClose();
  };

  const handleTrial = () => {
    localStorage.setItem("ff_onboarding_done", "true");
    onStartTrial();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md relative overflow-hidden">
        {/* Skip */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground z-10 flex items-center gap-1 text-xs"
        >
          ข้าม <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${current.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold">{current.title}</h2>
            <p className="text-sm text-muted mt-1">{current.subtitle}</p>
          </div>

          {/* Content */}
          <div className="mb-6">{current.content}</div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all",
                  i === step ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl font-medium text-sm bg-secondary hover:bg-border text-foreground transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                ก่อนหน้า
              </button>
            )}

            {isLast ? (
              <div className="flex-1 space-y-2">
                <button
                  onClick={handleTrial}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  เริ่มทดลองใช้โปร 3 วัน
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2 text-sm text-muted hover:text-foreground transition"
                >
                  ใช้แพลนฟรีก่อน
                </button>
              </div>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-1"
              >
                ถัดไป
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
