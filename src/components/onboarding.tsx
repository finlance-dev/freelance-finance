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
import { useLocale } from "@/hooks/useLocale";
import type { ReactNode } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}

interface Step {
  id: string;
  icon: typeof DollarSign;
  iconBg: string;
  title: string;
  subtitle: string;
  content: ReactNode;
}

export function OnboardingModal({ isOpen, onClose, onStartTrial }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const { t } = useLocale();

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      id: "welcome",
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-primary to-purple-500",
      title: t("onboarding", "welcomeTitle"),
      subtitle: t("onboarding", "welcomeSubtitle"),
      content: (
        <div className="space-y-3 text-sm text-muted leading-relaxed">
          <p>{t("onboarding", "welcomeDesc1")}</p>
          <p>{t("onboarding", "welcomeDesc2")}</p>
        </div>
      ),
    },
    {
      id: "quickstart",
      icon: Zap,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      title: t("onboarding", "quickstartTitle"),
      subtitle: t("onboarding", "quickstartSubtitle"),
      content: (
        <div className="space-y-3">
          {[
            { icon: Users, color: "text-primary bg-primary/10", label: t("onboarding", "step1Label"), desc: t("onboarding", "step1Desc") },
            { icon: ArrowLeftRight, color: "text-accent bg-accent/10", label: t("onboarding", "step2Label"), desc: t("onboarding", "step2Desc") },
            { icon: LayoutDashboard, color: "text-purple-500 bg-purple-500/10", label: t("onboarding", "step3Label"), desc: t("onboarding", "step3Desc") },
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
      title: t("onboarding", "plansTitle"),
      subtitle: t("onboarding", "plansSubtitle"),
      content: (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-xs font-semibold text-muted mb-2">{t("onboarding", "planFreeLabel")}</p>
            {[
              t("onboarding", "freeFeat1"),
              t("onboarding", "freeFeat2"),
              t("onboarding", "freeFeat3"),
              t("onboarding", "freeFeat4"),
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted mb-1">
                <div className="w-1 h-1 bg-muted rounded-full" />
                {f}
              </div>
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-primary mb-2">{t("onboarding", "planProLabel")}</p>
            {[
              { icon: ArrowLeftRight, label: t("onboarding", "proFeat1") },
              { icon: Users, label: t("onboarding", "proFeat2") },
              { icon: FileText, label: t("onboarding", "proFeat3") },
              { icon: BarChart3, label: t("onboarding", "proFeat4") },
              { icon: Calculator, label: t("onboarding", "proFeat5") },
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
      title: t("onboarding", "trialTitle"),
      subtitle: t("onboarding", "trialSubtitle"),
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-4 text-center">
            <Crown className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold mb-1">{t("onboarding", "trialCTA")}</p>
            <p className="text-xs text-muted">{t("onboarding", "trialDesc")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              t("onboarding", "trialFeat1"),
              t("onboarding", "trialFeat2"),
              t("onboarding", "trialFeat3"),
              t("onboarding", "trialFeat4"),
              t("onboarding", "trialFeat5"),
              t("onboarding", "trialFeat6"),
            ].map((f) => (
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
          {t("common", "skip")} <X className="w-3.5 h-3.5" />
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
                {t("common", "previous")}
              </button>
            )}

            {isLast ? (
              <div className="flex-1 space-y-2">
                <button
                  onClick={handleTrial}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("onboarding", "startTrialBtn")}
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2 text-sm text-muted hover:text-foreground transition"
                >
                  {t("onboarding", "useFreePlan")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-1"
              >
                {t("common", "next")}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
