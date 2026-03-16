"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign, Eye, EyeOff, Languages, Gift } from "lucide-react";
import { SignupIllustration } from "@/components/illustrations";
import { signUp, isCloudEnabled, signInWithGoogle } from "@/lib/supabase-store";
import { syncFromCloud } from "@/lib/store";
import { useLocale } from "@/hooks/useLocale";
import { logActivity } from "@/lib/activity-logger";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale, t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [refValid, setRefValid] = useState(false);

  // Check referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref.toUpperCase());
      fetch(`/api/referral/verify?code=${ref}`)
        .then(r => r.json())
        .then(data => {
          if (data.valid) setRefValid(true);
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError(t("auth", "errorFillAll"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth", "errorInvalidEmail"));
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
        // Save referral code for post-verification tracking
        if (refCode && refValid) {
          sessionStorage.setItem("ff_ref_code", refCode);
        }
        if (isCloudEnabled()) {
          // Supabase requires email verification
          router.push("/auth/verify");
        } else {
          // Demo mode: go straight to dashboard
          await syncFromCloud();
          router.push("/dashboard");
        }
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

        {refValid && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-accent">
            <Gift className="w-4 h-4 flex-shrink-0" />
            <span>คุณได้รับคำเชิญ! สมัครแล้วรับส่วนลดเมื่ออัพเกรด Pro</span>
          </div>
        )}

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

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-card text-muted">{t("auth", "or")}</span></div>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 border border-border bg-background hover:bg-secondary py-2.5 rounded-xl font-medium transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("auth", "continueWithGoogle")}
          </button>

          <p className="text-center text-sm text-muted">
            {t("auth", "hasAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("auth", "login")}
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
