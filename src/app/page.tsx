"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calculator,
  BarChart3,
  Users,
  ArrowRight,
  Check,
  DollarSign,
  PieChart,
  Shield,
  Zap,
  Menu,
  X,
  Languages,
  Quote,
  ChevronDown,
} from "lucide-react";
import { HeroIllustration } from "@/components/illustrations";
import { useLocale } from "@/hooks/useLocale";
import type { TranslationKey } from "@/lib/i18n";

const featureIcons = [TrendingUp, Calculator, BarChart3, Users, PieChart, Shield];
const featureKeys: { title: TranslationKey<"landing">; desc: TranslationKey<"landing"> }[] = [
  { title: "feat1Title", desc: "feat1Desc" },
  { title: "feat2Title", desc: "feat2Desc" },
  { title: "feat3Title", desc: "feat3Desc" },
  { title: "feat4Title", desc: "feat4Desc" },
  { title: "feat5Title", desc: "feat5Desc" },
  { title: "feat6Title", desc: "feat6Desc" },
];

const painKeys: TranslationKey<"landing">[] = ["pain1", "pain2", "pain3", "pain4", "pain5"];

const testimonialKeys = [
  { name: "testimonial1Name" as const, role: "testimonial1Role" as const, text: "testimonial1Text" as const },
  { name: "testimonial2Name" as const, role: "testimonial2Role" as const, text: "testimonial2Text" as const },
  { name: "testimonial3Name" as const, role: "testimonial3Role" as const, text: "testimonial3Text" as const },
];

const faqKeys = [
  { q: "faq1Q" as const, a: "faq1A" as const },
  { q: "faq2Q" as const, a: "faq2A" as const },
  { q: "faq3Q" as const, a: "faq3A" as const },
  { q: "faq4Q" as const, a: "faq4A" as const },
  { q: "faq5Q" as const, a: "faq5A" as const },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { locale, setLocale, t } = useLocale();

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  const pricingPlans = [
    {
      name: t("pricing", "planFree"),
      price: "0",
      period: "",
      description: t("pricing", "planFreeDesc"),
      features: [
        t("pricing", "feat_trackBasic"),
        t("pricing", "feat_basicDashboard"),
        t("pricing", "feat_maxClients3"),
        t("pricing", "feat_monthlySummary"),
      ],
      cta: t("landing", "ctaFree"),
      highlighted: false,
    },
    {
      name: t("pricing", "planPro"),
      price: "299",
      period: t("pricing", "perMonth"),
      description: t("pricing", "planProDesc"),
      features: [
        t("pricing", "feat_allFree"),
        t("pricing", "feat_unlimitedClients"),
        t("pricing", "feat_taxEstimate"),
        t("pricing", "feat_cashFlow"),
        t("pricing", "feat_projectProfit"),
        t("pricing", "feat_export"),
      ],
      cta: t("landing", "ctaPro"),
      highlighted: true,
    },
    {
      name: t("pricing", "planProYearly"),
      price: "2,499",
      period: t("pricing", "perYear"),
      description: t("pricing", "planProYearlyDesc"),
      features: [
        t("pricing", "feat_allPro"),
        t("pricing", "feat_prioritySupport"),
        t("pricing", "feat_earlyAccess"),
        t("pricing", "feat_save1000"),
      ],
      cta: t("landing", "ctaYearly"),
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Finlance</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted hover:text-foreground transition">
                {t("landing", "navFeatures")}
              </a>
              <a href="#pricing" className="text-muted hover:text-foreground transition">
                {t("landing", "navPricing")}
              </a>
              <a href="#faq" className="text-muted hover:text-foreground transition">
                {t("landing", "navFaq")}
              </a>
              <Link href="/login" className="text-muted hover:text-foreground transition">
                {t("auth", "login")}
              </Link>
              <button
                onClick={() => setLocale(locale === "th" ? "en" : "th")}
                className="text-muted hover:text-foreground transition flex items-center gap-1 text-sm"
              >
                <Languages className="w-4 h-4" />
                {locale === "th" ? "EN" : "TH"}
              </button>
              <Link
                href="/signup"
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium transition"
              >
                {t("landing", "startFree")}
              </Link>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 flex flex-col gap-3">
              <a href="#features" className="text-muted hover:text-foreground py-2">{t("landing", "navFeatures")}</a>
              <a href="#pricing" className="text-muted hover:text-foreground py-2">{t("landing", "navPricing")}</a>
              <a href="#faq" className="text-muted hover:text-foreground py-2">{t("landing", "navFaq")}</a>
              <Link href="/login" className="text-muted hover:text-foreground py-2">{t("auth", "login")}</Link>
              <button
                onClick={() => setLocale(locale === "th" ? "en" : "th")}
                className="text-muted hover:text-foreground py-2 text-left flex items-center gap-1"
              >
                <Languages className="w-4 h-4" />
                {locale === "th" ? "English" : "ภาษาไทย"}
              </button>
              <Link href="/signup" className="bg-primary text-white px-5 py-2 rounded-lg font-medium text-center">
                {t("landing", "startFree")}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            {t("landing", "badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t("landing", "heroTitle1")}
            <span className="text-primary"> {t("landing", "heroTitle2")}</span>
            <br />
            {t("landing", "heroTitle3")}
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10">
            {t("landing", "heroDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              {t("landing", "startFreeNoCc")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="border border-border hover:bg-secondary text-foreground px-8 py-3.5 rounded-xl font-semibold text-lg transition text-center"
            >
              {t("landing", "seeFeatures")}
            </a>
          </div>
          <p className="text-sm text-muted">
            {t("landing", "socialProof")}
          </p>
          <div className="mt-12 max-w-2xl mx-auto">
            <HeroIllustration className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-secondary/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            {t("landing", "painTitle")}
          </h2>
          <div className="grid gap-4 max-w-2xl mx-auto">
            {painKeys.map((key, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border"
              >
                <span className="text-danger text-xl mt-0.5">&#10005;</span>
                <p className="text-lg">{t("landing", key)}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-lg text-muted">
            {t("landing", "painSolution")}{" "}
            <span className="text-accent font-semibold">{t("landing", "painSolutionHighlight")}</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("landing", "featuresTitle")}
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {t("landing", "featuresDesc")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureKeys.map((fk, i) => {
              const Icon = featureIcons[i];
              return (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t("landing", fk.title)}</h3>
                  <p className="text-muted">{t("landing", fk.desc)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-secondary/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("landing", "pricingTitle")}
            </h2>
            <p className="text-lg text-muted">
              {t("landing", "pricingDesc")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`bg-card rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted
                    ? "border-primary shadow-xl scale-105"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-sm font-semibold text-primary mb-2">
                    {t("landing", "popular")}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === "0" ? t("common", "free") : `฿${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full block text-center py-3 rounded-xl font-semibold transition ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : "bg-secondary hover:bg-border text-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
            {t("landing", "testimonialsTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonialKeys.map((tk, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-foreground flex-1 mb-6 leading-relaxed">
                  &ldquo;{t("landing", tk.text)}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {t("landing", tk.name).charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t("landing", tk.name)}</p>
                    <p className="text-muted text-xs">{t("landing", tk.role)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-secondary/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
            {t("landing", "faqTitle")}
          </h2>
          <div className="space-y-3">
            {faqKeys.map((fk, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition"
                >
                  <span className="font-medium pr-4">{t("landing", fk.q)}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-muted leading-relaxed">
                    {t("landing", fk.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist / CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("landing", "ctaTitle")}
          </h2>
          <p className="text-lg text-muted mb-8">
            {t("landing", "ctaDesc")}
          </p>
          {submitted ? (
            <div className="bg-accent/10 text-accent-dark border border-accent/30 px-6 py-4 rounded-xl font-medium">
              <Check className="w-5 h-5 inline mr-2" />
              {t("landing", "ctaSuccess")}
            </div>
          ) : (
            <form
              onSubmit={handleWaitlist}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("landing", "emailPlaceholder")}
                required
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap"
              >
                {t("landing", "joinWaitlist")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="font-semibold">Finlance</span>
          </div>
          <p className="text-sm text-muted">
            &copy; 2026 Finlance — {t("landing", "footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
