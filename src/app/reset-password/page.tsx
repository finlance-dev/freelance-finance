"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign, Languages, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/hooks/useLocale";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError(t("auth", "errorFillAll"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth", "errorPassword6"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth", "errorPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        router.push("/login?message=password_updated");
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
          <h1 className="text-2xl font-bold mb-2">{t("auth", "resetTitle")}</h1>
          <p className="text-muted">{t("auth", "resetDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("auth", "newPassword")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth", "passwordPlaceholder")}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("auth", "confirmPassword")}</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth", "confirmPasswordPlaceholder")}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? t("common", "loading") : t("auth", "resetPassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
