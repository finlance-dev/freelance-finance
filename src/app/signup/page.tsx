"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign, Eye, EyeOff, Languages } from "lucide-react";
import { SignupIllustration } from "@/components/illustrations";
import { signUp } from "@/lib/supabase-store";
import { useLocale } from "@/hooks/useLocale";
import { logActivity } from "@/lib/activity-logger";

export default function SignupPage() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError(t("auth", "errorFillAll"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth", "errorPassword6"));
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signUp(email, password, name);
      if (authError) {
        setError(authError.message || t("auth", "errorSignup"));
      } else {
        logActivity("signup", `${name} signed up`, { email, name });
        router.push("/dashboard");
      }
    } catch {
      setError(t("auth", "errorGeneric"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="hidden lg:flex items-center justify-center flex-1 max-w-md">
        <SignupIllustration className="w-full max-w-sm h-auto opacity-90" />
      </div>
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
          <h1 className="text-2xl font-bold mb-2">{t("auth", "signupTitle")}</h1>
          <p className="text-muted">{t("auth", "signupSubtitle")}</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("auth", "name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth", "namePlaceholder")}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("auth", "password")}</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? t("auth", "signingUp") : t("auth", "signup")}
          </button>

          <p className="text-center text-sm text-muted">
            {t("auth", "hasAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("auth", "login")}
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          {t("auth", "demoDisclaimer")}
        </p>
      </div>
    </div>
  );
}
