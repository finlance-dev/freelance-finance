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
import { useLocale } from "@/hooks/useLocale";
import type { TranslationSection, TranslationKey } from "@/lib/i18n";

type TFunction = <S extends TranslationSection>(section: S, key: TranslationKey<S>) => string;

interface FeatureDetail {
  icon: React.ElementType;
  titleKey: string;
  href: string;
  freeDescKey: string;
  freeAvailable: boolean;
  freeLimitKey?: string;
  proDescKey: string;
  proExtraKey?: string;
}

const featureDefs: FeatureDetail[] = [
  {
    icon: LayoutDashboard,
    titleKey: "featDashboardTitle",
    href: "/dashboard",
    freeAvailable: true,
    freeDescKey: "featDashboardFreeDesc",
    freeLimitKey: "featDashboardFreeLimit",
    proDescKey: "featDashboardProDesc",
  },
  {
    icon: ArrowLeftRight,
    titleKey: "featTransactionsTitle",
    href: "/dashboard/transactions",
    freeAvailable: true,
    freeDescKey: "featTransactionsFreeDesc",
    freeLimitKey: "featTransactionsFreeLimit",
    proDescKey: "featTransactionsProDesc",
    proExtraKey: "featTransactionsProExtra",
  },
  {
    icon: Users,
    titleKey: "featClientsTitle",
    href: "/dashboard/clients",
    freeAvailable: true,
    freeDescKey: "featClientsFreeDesc",
    freeLimitKey: "featClientsFreeLimit",
    proDescKey: "featClientsProDesc",
    proExtraKey: "featClientsProExtra",
  },
  {
    icon: FileText,
    titleKey: "featInvoicesTitle",
    href: "/dashboard/invoices",
    freeAvailable: false,
    freeDescKey: "featInvoicesFreeDesc",
    proDescKey: "featInvoicesProDesc",
    proExtraKey: "featInvoicesProExtra",
  },
  {
    icon: BarChart3,
    titleKey: "featReportsTitle",
    href: "/dashboard/reports",
    freeAvailable: false,
    freeDescKey: "featReportsFreeDesc",
    proDescKey: "featReportsProDesc",
  },
  {
    icon: RefreshCw,
    titleKey: "featRecurringTitle",
    href: "/dashboard/recurring",
    freeAvailable: false,
    freeDescKey: "featRecurringFreeDesc",
    proDescKey: "featRecurringProDesc",
  },
  {
    icon: Calculator,
    titleKey: "featTaxTitle",
    href: "/dashboard/tax",
    freeAvailable: false,
    freeDescKey: "featTaxFreeDesc",
    proDescKey: "featTaxProDesc",
  },
  {
    icon: UserCircle,
    titleKey: "featProfileTitle",
    href: "/dashboard/profile",
    freeAvailable: false,
    freeDescKey: "featProfileFreeDesc",
    proDescKey: "featProfileProDesc",
  },
  {
    icon: Settings,
    titleKey: "featSettingsTitle",
    href: "/dashboard/settings",
    freeAvailable: true,
    freeDescKey: "featSettingsFreeDesc",
    freeLimitKey: "featSettingsFreeLimit",
    proDescKey: "featSettingsProDesc",
    proExtraKey: "featSettingsProExtra",
  },
  {
    icon: CreditCard,
    titleKey: "featPricingTitle",
    href: "/dashboard/pricing",
    freeAvailable: true,
    freeDescKey: "featPricingFreeDesc",
    proDescKey: "featPricingProDesc",
  },
];

function FeatureCard({
  feature,
  mode,
  t,
}: {
  feature: FeatureDetail;
  mode: "free" | "pro";
  t: TFunction;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = feature.icon;

  const isFree = mode === "free";
  const available = isFree ? feature.freeAvailable : true;
  const tg = (key: string) => t("guide", key as TranslationKey<"guide">);

  const description = isFree
    ? tg(feature.freeDescKey)
    : tg(feature.proDescKey);

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
            <span className="font-semibold text-sm">
              {tg(feature.titleKey)}
            </span>
            {available ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-muted shrink-0" />
            )}
          </div>
          {isFree && feature.freeLimitKey && (
            <p className="text-xs text-warning mt-0.5">
              {tg(feature.freeLimitKey!)}
            </p>
          )}
          {!isFree && feature.proExtraKey && (
            <p className="text-xs text-primary mt-0.5">
              {tg(feature.proExtraKey!)}
            </p>
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
          <p className="text-sm text-muted leading-relaxed mt-3">
            {description}
          </p>
          {available && (
            <Link
              href={feature.href}
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary font-medium hover:underline"
            >
              {t("guide", "goToPage")}
            </Link>
          )}
          {!available && isFree && (
            <Link
              href="/dashboard/pricing"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary font-medium hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              {t("guide", "upgradeToPro")}
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
  const { locale, t } = useLocale();

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

  const freeFeatures = featureDefs.filter((f) => f.freeAvailable);
  const lockedFeatures = featureDefs.filter((f) => !f.freeAvailable);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("guide", "title")}</h1>
        </div>
        <p className="text-muted text-sm mt-1">
          {t("guide", "subtitle")}
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
          {t("guide", "freePlan")}
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
          {t("guide", "proPlan")}
        </button>
      </div>

      {/* Free Plan Tab */}
      {activeTab === "free" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-secondary to-secondary/50 border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="font-bold">{t("guide", "freeSummaryTitle")}</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {t("guide", "freeSummaryDesc")}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="bg-card border border-border px-3 py-1 rounded-full">
                {t("guide", "freeMax3Clients")}
              </span>
              <span className="bg-card border border-border px-3 py-1 rounded-full">
                {t("guide", "freeMax30Entries")}
              </span>
              <span className="bg-card border border-border px-3 py-1 rounded-full">
                {t("guide", "freeForever")}
              </span>
            </div>
          </div>

          {/* Available Features */}
          <div>
            <h3 className="text-sm font-semibold text-accent flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              {t("guide", "availableFeatures")} ({freeFeatures.length} {t("guide", "features")})
            </h3>
            <div className="space-y-2">
              {freeFeatures.map((f) => (
                <FeatureCard key={f.titleKey} feature={f} mode="free" t={t} />
              ))}
            </div>
          </div>

          {/* Locked Features */}
          <div>
            <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4" />
              {t("guide", "lockedFeatures")} ({lockedFeatures.length} {t("guide", "features")})
            </h3>
            <div className="space-y-2">
              {lockedFeatures.map((f) => (
                <FeatureCard key={f.titleKey} feature={f} mode="free" t={t} />
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isPro && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-bold mb-1">{t("guide", "unlockAll")}</h3>
              <p className="text-sm text-muted mb-4">
                {t("guide", "unlockAllDesc")}
              </p>
              <Link
                href="/dashboard/pricing"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                <Crown className="w-4 h-4" />
                {t("guide", "viewPlans")}
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
              <h2 className="font-bold">{t("guide", "proSummaryTitle")}</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {t("guide", "proSummaryDesc")}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <span className="bg-card border border-primary/20 text-primary px-3 py-1 rounded-full">
                {t("guide", "unlimitedClients")}
              </span>
              <span className="bg-card border border-primary/20 text-primary px-3 py-1 rounded-full">
                {t("guide", "unlimitedEntries")}
              </span>
              <span className="bg-card border border-primary/20 text-primary px-3 py-1 rounded-full">
                {t("guide", "proPricing")}
              </span>
            </div>
          </div>

          {/* All Features */}
          <div>
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              {t("guide", "allFeatures")} ({featureDefs.length} {t("guide", "features")})
            </h3>
            <div className="space-y-2">
              {featureDefs.map((f) => (
                <FeatureCard key={f.titleKey} feature={f} mode="pro" t={t} />
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isPro && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-bold mb-1">{t("guide", "readyToUpgrade")}</h3>
              <p className="text-sm text-muted mb-4">
                {t("guide", "readyToUpgradeDesc")}
              </p>
              <Link
                href="/dashboard/pricing"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                <Crown className="w-4 h-4" />
                {t("guide", "upgradeNow")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
