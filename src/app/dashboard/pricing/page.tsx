"use client";

import { useState } from "react";
import { Check, Sparkles, Crown, QrCode, X } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import type { PlanType } from "@/lib/types";
import { generatePromptPayQRDataURL } from "@/lib/promptpay";
import { CelebrationModal } from "@/components/celebration-modal";

const plans = [
  {
    id: "free" as PlanType,
    name: "ฟรี",
    price: "0",
    period: "",
    description: "เริ่มต้นใช้งานพื้นฐาน",
    features: [
      "ติดตามรายรับ-รายจ่าย (30 รายการ)",
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

const PROMPTPAY_MERCHANT = "0899999999"; // FreelanceFlow merchant PromptPay

export default function PricingPage() {
  const { plan: currentPlan, upgrade, mounted, trialAvailable, startTrial } = usePlan();
  const [qrModal, setQrModal] = useState<{ plan: PlanType; price: number; name: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [celebration, setCelebration] = useState<{ planName: string } | null>(null);

  const doUpgrade = (planId: PlanType, name: string) => {
    upgrade(planId);
    if (planId !== "free") {
      setCelebration({ planName: `แพลน${name}` });
    }
  };

  const handleUpgradeWithQR = async (planId: PlanType, price: number, name: string) => {
    if (planId === "free") {
      upgrade(planId);
      return;
    }
    setQrModal({ plan: planId, price, name });
    setQrLoading(true);
    try {
      const url = await generatePromptPayQRDataURL(PROMPTPAY_MERCHANT, price);
      setQrDataUrl(url);
    } catch {
      setQrDataUrl("");
    }
    setQrLoading(false);
  };

  const handleConfirmPayment = () => {
    if (qrModal) {
      doUpgrade(qrModal.plan, qrModal.name);
      setQrModal(null);
      setQrDataUrl("");
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">เลือกแพลนของคุณ</h1>
        <p className="text-muted text-sm mt-1">อัปเกรดเพื่อปลดล็อคฟีเจอร์ทั้งหมด</p>
      </div>

      {trialAvailable && (
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-5 text-center max-w-lg mx-auto">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-bold mb-1">ยังไม่แน่ใจ? ทดลองใช้โปรฟรี 3 วัน!</h3>
          <p className="text-sm text-muted mb-3">ใช้ทุกฟีเจอร์ได้เต็มที่ ไม่ต้องผูกบัตร หมดแล้วกลับเป็นฟรีอัตโนมัติ</p>
          <button
            onClick={() => {
              startTrial();
              setCelebration({ planName: "ทดลองโปร 3 วัน" });
            }}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition inline-flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            เริ่มทดลองใช้ฟรี 3 วัน
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((p) => {
          const isCurrentPlan = currentPlan === p.id;
          const numericPrice = Number(p.price.replace(/,/g, ""));
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
                <div className="space-y-2">
                  <button
                    onClick={() => doUpgrade(p.id, p.name)}
                    className={`w-full py-2.5 rounded-xl font-semibold transition ${
                      p.highlighted
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "bg-secondary hover:bg-border text-foreground"
                    }`}
                  >
                    {p.id === "free" ? "ดาวน์เกรด" : `อัปเกรดเป็น${p.name}`}
                  </button>
                  {p.id !== "free" && (
                    <button
                      onClick={() => handleUpgradeWithQR(p.id, numericPrice, p.name)}
                      className="w-full py-2 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 border border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <QrCode className="w-4 h-4" />
                      ชำระผ่าน PromptPay
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PromptPay QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">ชำระเงินผ่าน PromptPay</h2>
              <button onClick={() => { setQrModal(null); setQrDataUrl(""); }} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-muted mb-1">แพลน{qrModal.name}</p>
              <p className="text-2xl font-bold text-primary">฿{qrModal.price.toLocaleString()}</p>
            </div>

            {qrLoading ? (
              <div className="py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted mt-3">กำลังสร้าง QR Code...</p>
              </div>
            ) : qrDataUrl ? (
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 inline-block">
                  <img src={qrDataUrl} alt="PromptPay QR" className="w-56 h-56 mx-auto" />
                </div>
                <p className="text-xs text-muted">สแกน QR Code ด้วยแอปธนาคาร</p>
              </div>
            ) : (
              <p className="text-sm text-danger py-8">ไม่สามารถสร้าง QR Code ได้</p>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                ชำระแล้ว — เปิดใช้งาน
              </button>
              <p className="text-xs text-muted">โหมดทดลอง: กดเพื่อเปิดใช้งานทันที</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted">
        โหมดทดลอง: การเปลี่ยนแพลนมีผลทันที ยังไม่มีการเรียกเก็บเงินจริง
      </p>

      <CelebrationModal
        isOpen={!!celebration}
        onClose={() => setCelebration(null)}
        planName={celebration?.planName || ""}
      />
    </div>
  );
}
