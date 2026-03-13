"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, Languages, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/hooks/useLocale";

export default function ForgotPasswordPage() {
  const { locale, setLocale, t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t("auth", "errorFillAll"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth", "errorInvalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError(t("auth", "errorGeneric"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
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
          <h1 className="text-2xl font-bold mb-2">{t("auth", "forgotPassword")}</h1>
          <p className="text-muted">{t("auth", "forgotDesc")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="bg-accent/10 text-accent-dark border border-accent/30 px-4 py-3 rounded-xl text-sm">
                {t("auth", "resetEmailSent")}
              </div>
              <p className="text-muted text-sm">{t("auth", "checkInbox")}</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("auth", "email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth", "emailPlaceholder")}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {loading ? t("common", "loading") : t("auth", "sendResetLink")}
                </button>
              </form>
            </>
          )}

          <div className="text-center pt-2">
            <Link href="/login" className="text-primary hover:underline font-medium text-sm inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              {t("auth", "backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
