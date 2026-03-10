"use client";

import { Check, Sparkles, Crown } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import type { PlanType } from "@/lib/types";

const plans = [
  {
    id: "free" as PlanType,
    name: "ฟรี",
    price: "0",
    period: "",
    description: "เริ่มต้นใช้งานพื้นฐาน",
    features: [
      "ติดตามรายรับ-รายจ่าย (50 รายการ)",
      "แดชบอร์ดพื้นฐาน",
      "ลูกค้าได้สูงสุด 3 ราย",
      "สรุปรายเดือน",
    ],
    notIncluded: [
      "ประมาณภาษีและแจ้งเตือน",
      "พยากรณ์กระแสเงินสด",
      "วิเคราะห์กำไรรายโปรเจกต์",
      "ส่งออกรายงาน (CSV/PDF)",
    ],
    highlighted: false,
    icon: null,
  },
  {
    id: "pro" as PlanType,
    name: "โปร",
    price: "299",
    period: "/เดือน",
    description: "ทุกอย่างที่คุณต้องการจัดการการเงิน",
    features: [
      "ทุกฟีเจอร์ในแพลนฟรี",
      "ลูกค้าและโปรเจกต์ไม่จำกัด",
      "รายการเงินไม่จำกัด",
      "ประมาณภาษีและแจ้งเตือน",
      "พยากรณ์กระแสเงินสด",
      "วิเคราะห์กำไรรายโปรเจกต์",
      "ส่งออกรายงาน (CSV/PDF)",
    ],
    notIncluded: [],
    highlighted: true,
    icon: Sparkles,
  },
  {
    id: "pro_yearly" as PlanType,
    name: "โปรรายปี",
    price: "2,499",
    period: "/ปี",
    description: "ประหยัด 30% เมื่อจ่ายรายปี",
    features: [
      "ทุกฟีเจอร์ในแพลนโปร",
      "ซัพพอร์ตเร่งด่วน",
      "เข้าถึงฟีเจอร์ใหม่ก่อนใคร",
      "ประหยัดกว่า 1,000 บาท/ปี",
    ],
    notIncluded: [],
    highlighted: false,
    icon: Crown,
  },
];

export default function PricingPage() {
  const { plan: currentPlan, upgrade, mounted } = usePlan();

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">เลือกแพลนของคุณ</h1>
        <p className="text-muted text-sm mt-1">อัปเกรดเพื่อปลดล็อคฟีเจอร์ทั้งหมด</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((p) => {
          const isCurrentPlan = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`bg-card rounded-2xl p-6 border-2 transition-all ${
                p.highlighted
                  ? "border-primary shadow-lg"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {p.icon && <p.icon className="w-5 h-5 text-primary" />}
                <h3 className="text-lg font-bold">{p.name}</h3>
                {isCurrentPlan && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    ปัจจุบัน
                  </span>
                )}
              </div>
              <p className="text-muted text-sm mb-4">{p.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {p.price === "0" ? "ฟรี" : `฿${p.price}`}
                </span>
                {p.period && <span className="text-muted">{p.period}</span>}
              </div>

              <ul className="space-y-2.5 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
                {p.notIncluded.map((f, i) => (
                  <li key={`no-${i}`} className="flex items-start gap-2 opacity-40">
                    <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-xs">&#10005;</span>
                    <span className="text-sm line-through">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl font-semibold bg-secondary text-muted cursor-not-allowed"
                >
                  แพลนปัจจุบัน
                </button>
              ) : (
                <button
                  onClick={() => upgrade(p.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold transition ${
                    p.highlighted
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : "bg-secondary hover:bg-border text-foreground"
                  }`}
                >
                  {p.id === "free" ? "ดาวน์เกรด" : `อัปเกรดเป็น${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted">
        โหมดทดลอง: การเปลี่ยนแพลนมีผลทันที ยังไม่มีการเรียกเก็บเงินจริง
      </p>
    </div>
  );
}
