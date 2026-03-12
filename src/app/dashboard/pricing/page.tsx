"use client";

import { useState } from "react";
import { Check, Sparkles, Crown, QrCode, X } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useLocale } from "@/hooks/useLocale";
import type { PlanType } from "@/lib/types";
import { generatePromptPayQRDataURL } from "@/lib/promptpay";
import { CelebrationModal } from "@/components/celebration-modal";
import type { TranslationKey } from "@/lib/i18n";

const PROMPTPAY_MERCHANT = "0899999999";

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

export default function PricingPage() {
  const { plan: currentPlan, upgrade, mounted, trialAvailable, startTrial } = usePlan();
  const { locale, t } = useLocale();
  const [qrModal, setQrModal] = useState<{ plan: PlanType; price: number; name: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [celebration, setCelebration] = useState<{ planName: string } | null>(null);

  const doUpgrade = (planId: PlanType, name: string) => {
    upgrade(planId);
    if (planId !== "free") {
      setCelebration({ planName: name });
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
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => doUpgrade(p.id, planName)}
                    className={`w-full py-2.5 rounded-xl font-semibold transition ${
                      p.highlighted
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "bg-secondary hover:bg-border text-foreground"
                    }`}
                  >
                    {p.id === "free" ? t("pricing", "downgrade") : `${t("pricing", "upgradeTo")} ${planName}`}
                  </button>
                  {p.id !== "free" && (
                    <button
                      onClick={() => handleUpgradeWithQR(p.id, numericPrice, planName)}
                      className="w-full py-2 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 border border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <QrCode className="w-4 h-4" />
                      {t("pricing", "payViaPromptPay")}
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
              <h2 className="text-lg font-bold">{t("pricing", "paymentTitle")}</h2>
              <button onClick={() => { setQrModal(null); setQrDataUrl(""); }} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-muted mb-1">{qrModal.name}</p>
              <p className="text-2xl font-bold text-primary">฿{qrModal.price.toLocaleString()}</p>
            </div>

            {qrLoading ? (
              <div className="py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted mt-3">{t("pricing", "generatingQR")}</p>
              </div>
            ) : qrDataUrl ? (
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 inline-block">
                  <img src={qrDataUrl} alt="PromptPay QR" className="w-56 h-56 mx-auto" />
                </div>
                <p className="text-xs text-muted">{t("pricing", "scanQR")}</p>
              </div>
            ) : (
              <p className="text-sm text-danger py-8">{t("pricing", "qrError")}</p>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                {t("pricing", "confirmPayment")}
              </button>
              <p className="text-xs text-muted">{t("pricing", "demoPayment")}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted">
        {t("pricing", "demoDisclaimer")}
      </p>

      <CelebrationModal
        isOpen={!!celebration}
        onClose={() => setCelebration(null)}
        planName={celebration?.planName || ""}
      />
    </div>
  );
}
