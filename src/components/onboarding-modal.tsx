"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Users,
  BarChart3,
  Database,
  X,
} from "lucide-react";

const ONBOARDING_KEY = "ff_onboarding_done";

export function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  const steps = [
    {
      icon: Sparkles,
      title: "ยินดีต้อนรับสู่ Finlance!",
      desc: "ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์ ช่วยจัดการรายรับ-รายจ่าย ประมาณภาษี และสร้างใบแจ้งหนี้",
      color: "text-primary",
    },
    {
      icon: ArrowLeftRight,
      title: "เพิ่มรายการ",
      desc: "เริ่มต้นด้วยการเพิ่มรายรับ-รายจ่าย ระบบจะคำนวณสรุปให้อัตโนมัติ",
      color: "text-accent",
    },
    {
      icon: Users,
      title: "จัดการลูกค้า",
      desc: "เพิ่มลูกค้าและโปรเจกต์ เพื่อติดตามรายได้แยกตามลูกค้า",
      color: "text-warning",
    },
    {
      icon: BarChart3,
      title: "วิเคราะห์การเงิน",
      desc: "ดูกราฟ รายงาน และประมาณภาษี ช่วยวางแผนการเงินระยะยาว",
      color: "text-primary",
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center py-4">
          <div className={`inline-flex p-4 rounded-2xl bg-secondary mb-4 ${current.color}`}>
            <current.icon className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">{current.title}</h2>
          <p className="text-muted text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 my-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step < steps.length - 1 ? (
            <>
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 text-sm text-muted hover:text-foreground transition rounded-xl"
              >
                ข้าม
              </button>
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 py-2.5 text-sm bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition"
              >
                ถัดไป <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              <Link
                href="/dashboard/transactions"
                onClick={dismiss}
                className="w-full py-2.5 text-sm bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition"
              >
                <ArrowLeftRight className="w-4 h-4" />
                เริ่มเพิ่มรายการ
              </Link>
              <button
                onClick={() => {
                  dismiss();
                  // Trigger load demo data
                  window.dispatchEvent(new CustomEvent("ff_load_demo"));
                }}
                className="w-full py-2.5 text-sm bg-secondary text-foreground rounded-xl font-medium flex items-center justify-center gap-1.5 hover:bg-border transition"
              >
                <Database className="w-4 h-4" />
                โหลดข้อมูลตัวอย่าง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
