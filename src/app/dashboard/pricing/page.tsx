"use client";

import { useState, useRef } from "react";
import { Check, Sparkles, Crown, QrCode, X, Upload, Clock, Image } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useLocale } from "@/hooks/useLocale";
import type { PlanType } from "@/lib/types";
import { generatePromptPayQRDataURL } from "@/lib/promptpay";
import { CelebrationModal } from "@/components/celebration-modal";
import { useToast } from "@/components/toast";
import { getCurrentUser } from "@/lib/supabase-store";
import type { TranslationKey } from "@/lib/i18n";

const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID || "0899999999";

interface PlanConfig {
  id: PlanType;
  nameKey: TranslationKey<"pricing">;
  price: string;
  periodKey: TranslationKey<"pricing"> | null;
  descKey: TranslationKey<"pricing">;
  featureKeys: TranslationKey<"pricing">[];
  notIncludedKeys: TranslationKey<"pricing">[];
  highlighted: boolean;
  icon: typeof Sparkles | null;
}

const planConfigs: PlanConfig[] = [
  {
    id: "free",
    nameKey: "planFree",
    price: "0",
    periodKey: null,
    descKey: "planFreeDesc",
    featureKeys: ["feat_trackBasic", "feat_basicDashboard", "feat_maxClients3", "feat_monthlySummary"],
    notIncludedKeys: ["feat_taxEstimate", "feat_cashFlow", "feat_projectProfit", "feat_export"],
    highlighted: false,
    icon: null,
  },
  {
    id: "pro",
    nameKey: "planPro",
    price: "299",
    periodKey: "perMonth",
    descKey: "planProDesc",
    featureKeys: ["feat_allFree", "feat_unlimitedClients", "feat_unlimitedTx", "feat_taxEstimate", "feat_cashFlow", "feat_projectProfit", "feat_export"],
    notIncludedKeys: [],
    highlighted: true,
    icon: Sparkles,
  },
  {
    id: "pro_yearly",
    nameKey: "planProYearly",
    price: "2,499",
    periodKey: "perYear",
    descKey: "planProYearlyDesc",
    featureKeys: ["feat_allPro", "feat_prioritySupport", "feat_earlyAccess", "feat_save1000"],
    notIncludedKeys: [],
    highlighted: false,
    icon: Crown,
  },
];

type PaymentStep = "qr" | "upload" | "done";

export default function PricingPage() {
  const { plan: currentPlan, upgrade, mounted, trialAvailable, startTrial } = usePlan();
  const { locale, t } = useLocale();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qrModal, setQrModal] = useState<{ plan: PlanType; price: number; name: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [celebration, setCelebration] = useState<{ planName: string } | null>(null);

  // Payment flow state
  const [step, setStep] = useState<PaymentStep>("qr");
  const [orderId, setOrderId] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const resetPayment = () => {
    setQrModal(null);
    setQrDataUrl("");
    setStep("qr");
    setOrderId("");
    setSlipFile(null);
    setSlipPreview("");
    setUploading(false);
  };

  const handleUpgradeWithQR = async (planId: PlanType, price: number, name: string) => {
    if (planId === "free") {
      upgrade(planId);
      return;
    }
    setQrModal({ plan: planId, price, name });
    setStep("qr");
    setQrLoading(true);
    try {
      const url = await generatePromptPayQRDataURL(PROMPTPAY_ID, price);
      setQrDataUrl(url);
    } catch {
      setQrDataUrl("");
    }
    setQrLoading(false);
  };

  const handleProceedToUpload = async () => {
    if (!qrModal) return;

    // Create payment order
    try {
      const user = await getCurrentUser();
      const localUser = localStorage.getItem("ff_user");
      const parsed = localUser ? JSON.parse(localUser) : {};

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || parsed.id || "local",
          userEmail: user?.email || parsed.email || "",
          userName: user?.user_metadata?.name || parsed.name || "",
          plan: qrModal.plan,
          amount: qrModal.price,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderId(data.orderId);
        setStep("upload");
      } else if (data.error === "pending_exists") {
        setOrderId(data.orderId);
        setStep("upload");
        toast(locale === "th" ? "คุณมีคำสั่งซื้อที่รอดำเนินการอยู่แล้ว" : "You have a pending order", "warning");
      } else {
        toast(data.error || "Error creating order", "error");
      }
    } catch {
      toast(locale === "th" ? "เกิดข้อผิดพลาด" : "An error occurred", "error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast(locale === "th" ? "รองรับเฉพาะ JPG, PNG, WebP" : "Only JPG, PNG, WebP allowed", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast(locale === "th" ? "ไฟล์ใหญ่เกิน 10MB" : "File too large (max 10MB)", "error");
      return;
    }

    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  const handleUploadSlip = async () => {
    if (!slipFile || !orderId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("slip", slipFile);
      formData.append("orderId", orderId);

      const res = await fetch("/api/payment/upload-slip", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStep("done");
        toast(locale === "th" ? "ส่งสลิปเรียบร้อย รอการตรวจสอบ" : "Slip submitted. Awaiting review.", "success");
      } else {
        const data = await res.json();
        toast(data.error || "Upload failed", "error");
      }
    } catch {
      toast(locale === "th" ? "อัพโหลดล้มเหลว" : "Upload failed", "error");
    }
    setUploading(false);
  };

  if (!mounted) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-secondary rounded-xl mx-auto" />
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-72 bg-secondary rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("pricing", "title")}</h1>
        <p className="text-muted text-sm mt-1">{t("pricing", "subtitle")}</p>
      </div>

      {trialAvailable && (
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-5 text-center max-w-lg mx-auto">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-bold mb-1">{t("pricing", "trialTitle")}</h3>
          <p className="text-sm text-muted mb-3">{t("pricing", "trialDesc")}</p>
          <button
            onClick={() => {
              startTrial();
              setCelebration({ planName: locale === "th" ? "ทดลองโปร 3 วัน" : "3-day Pro Trial" });
            }}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition inline-flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {t("pricing", "startTrial")}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {planConfigs.map((p) => {
          const isCurrentPlan = currentPlan === p.id;
          const numericPrice = Number(p.price.replace(/,/g, ""));
          const planName = t("pricing", p.nameKey);
          return (
            <div
              key={p.id}
              className={`bg-card rounded-2xl p-6 border-2 transition-all ${
                p.highlighted ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {p.icon && <p.icon className="w-5 h-5 text-primary" />}
                <h3 className="text-lg font-bold">{planName}</h3>
                {isCurrentPlan && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {t("plan", "current")}
                  </span>
                )}
              </div>
              <p className="text-muted text-sm mb-4">{t("pricing", p.descKey)}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {p.price === "0" ? t("common", "free") : `฿${p.price}`}
                </span>
                {p.periodKey && <span className="text-muted">{t("pricing", p.periodKey)}</span>}
              </div>

              <ul className="space-y-2.5 mb-6">
                {p.featureKeys.map((fk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing", fk)}</span>
                  </li>
                ))}
                {p.notIncludedKeys.map((fk, i) => (
                  <li key={`no-${i}`} className="flex items-start gap-2 opacity-40">
                    <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-xs">&#10005;</span>
                    <span className="text-sm line-through">{t("pricing", fk)}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl font-semibold bg-secondary text-muted cursor-not-allowed"
                >
                  {t("plan", "currentPlan")}
                </button>
              ) : p.id === "free" ? (
                <button
                  onClick={() => upgrade(p.id)}
                  className="w-full py-2.5 rounded-xl font-semibold transition bg-secondary hover:bg-border text-foreground"
                >
                  {t("pricing", "downgrade")}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgradeWithQR(p.id, numericPrice, planName)}
                  className={`w-full py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    p.highlighted
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : "bg-secondary hover:bg-border text-foreground"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  {locale === "th" ? "ชำระผ่าน PromptPay" : "Pay via PromptPay"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Payment Modal ── */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {step === "qr" && (locale === "th" ? "ชำระเงิน" : "Payment")}
                {step === "upload" && (locale === "th" ? "แนบสลิปโอนเงิน" : "Upload Slip")}
                {step === "done" && (locale === "th" ? "ส่งเรียบร้อย" : "Submitted")}
              </h2>
              <button onClick={resetPayment} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price info */}
            <div className="bg-primary/5 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-muted">{qrModal.name}</p>
              <p className="text-2xl font-bold text-primary">฿{qrModal.price.toLocaleString()}</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[
                { key: "qr", label: locale === "th" ? "สแกน QR" : "Scan QR" },
                { key: "upload", label: locale === "th" ? "แนบสลิป" : "Upload" },
                { key: "done", label: locale === "th" ? "เสร็จสิ้น" : "Done" },
              ].map((s, i) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-6 h-px bg-border" />}
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    step === s.key ? "text-primary" :
                    ["qr", "upload", "done"].indexOf(step) > i ? "text-accent" : "text-muted"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === s.key ? "bg-primary text-white" :
                      ["qr", "upload", "done"].indexOf(step) > i ? "bg-accent text-white" : "bg-secondary"
                    }`}>
                      {["qr", "upload", "done"].indexOf(step) > i ? "✓" : i + 1}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 1: QR Code */}
            {step === "qr" && (
              <div className="text-center">
                {qrLoading ? (
                  <div className="py-12">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </div>
                ) : qrDataUrl ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-3 inline-block">
                      <img src={qrDataUrl} alt="PromptPay QR" className="w-52 h-52 mx-auto" />
                    </div>
                    <p className="text-xs text-muted">
                      {locale === "th" ? "สแกน QR Code เพื่อโอนเงิน" : "Scan QR to transfer"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-danger py-8">{t("pricing", "qrError")}</p>
                )}

                <button
                  onClick={handleProceedToUpload}
                  disabled={!qrDataUrl}
                  className="w-full mt-4 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {locale === "th" ? "โอนแล้ว → แนบสลิป" : "Transferred → Upload Slip"}
                </button>
              </div>
            )}

            {/* Step 2: Upload Slip */}
            {step === "upload" && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {slipPreview ? (
                  <div className="relative">
                    <img
                      src={slipPreview}
                      alt="Slip preview"
                      className="w-full max-h-64 object-contain rounded-xl border border-border"
                    />
                    <button
                      onClick={() => { setSlipFile(null); setSlipPreview(""); }}
                      className="absolute top-2 right-2 bg-danger text-white p-1 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center transition group"
                  >
                    <Upload className="w-8 h-8 text-muted group-hover:text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {locale === "th" ? "คลิกเพื่อเลือกไฟล์" : "Click to select file"}
                    </p>
                    <p className="text-xs text-muted mt-1">JPG, PNG, WebP ({locale === "th" ? "สูงสุด" : "max"} 10MB)</p>
                  </button>
                )}

                <button
                  onClick={handleUploadSlip}
                  disabled={!slipFile || uploading}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {locale === "th" ? "กำลังอัพโหลด..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      {locale === "th" ? "ยืนยันการชำระเงิน" : "Confirm Payment"}
                    </>
                  )}
                </button>

                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted font-medium mb-1.5">
                    {locale === "th" ? "ขั้นตอนการชำระเงิน:" : "Payment steps:"}
                  </p>
                  <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                    <li>{locale === "th" ? "โอนเงินตามจำนวนที่ระบุข้างต้น" : "Transfer the amount shown above"}</li>
                    <li>{locale === "th" ? "แนบสลิปการโอนเงิน" : "Upload your transfer slip"}</li>
                    <li>{locale === "th" ? "กดยืนยันการชำระเงิน" : "Click confirm payment"}</li>
                    <li>{locale === "th" ? "ระบบจะตรวจสอบและเปิดใช้งานให้อัตโนมัติ" : "We'll verify and activate your plan"}</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Step 3: Done */}
            {step === "done" && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {locale === "th" ? "ส่งสลิปเรียบร้อยแล้ว!" : "Slip Submitted!"}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    {locale === "th"
                      ? "เราจะตรวจสอบและเปิดใช้งานแพลนให้คุณภายใน 24 ชั่วโมง"
                      : "We'll verify and activate your plan within 24 hours"}
                  </p>
                </div>
                <button
                  onClick={resetPayment}
                  className="bg-secondary hover:bg-border text-foreground py-2 px-6 rounded-xl font-medium transition"
                >
                  {locale === "th" ? "ปิด" : "Close"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <CelebrationModal
        isOpen={!!celebration}
        onClose={() => setCelebration(null)}
        planName={celebration?.planName || ""}
      />
    </div>
  );
}
