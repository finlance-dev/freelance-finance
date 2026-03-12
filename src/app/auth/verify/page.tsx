"use client";

import Link from "next/link";
import { DollarSign, Mail, Languages } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export default function VerifyEmailPage() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">Finlance</span>
          </Link>
          <button
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
            className="text-muted hover:text-foreground transition flex items-center gap-1 text-xs"
          >
            <Languages className="w-3.5 h-3.5" />
            {locale === "th" ? "EN" : "TH"}
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">
            {t("auth", "verifyTitle")}
          </h1>
          <p className="text-muted mb-6 leading-relaxed">
            {t("auth", "verifyDesc")}
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition"
          >
            {t("auth", "backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
