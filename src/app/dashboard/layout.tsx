"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DollarSign,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Calculator,
  LogOut,
  Menu,
  X,
  CreditCard,
  Sparkles,
  FileText,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Monitor,
  UserCircle,
  BookOpen,
  Languages,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/components/theme-provider";
import { processRecurringTransactions, syncFromCloud, isCloudEnabled, getOverdueInvoiceCount } from "@/lib/store";
import { signOut, getCurrentUser } from "@/lib/supabase-store";
import { BarChart3 } from "lucide-react";
import { OnboardingModal } from "@/components/onboarding";
import { NotificationBell } from "@/components/notification-bell";
import { FeedbackButton } from "@/components/feedback-button";
import type { TranslationKey } from "@/lib/i18n";

const navItems: { href: string; labelKey: TranslationKey<"nav">; icon: typeof LayoutDashboard; badge?: "overdue" }[] = [
  { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
  { href: "/dashboard/transactions", labelKey: "transactions", icon: ArrowLeftRight },
  { href: "/dashboard/clients", labelKey: "clients", icon: Users },
  { href: "/dashboard/invoices", labelKey: "invoices", icon: FileText, badge: "overdue" },
  { href: "/dashboard/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/dashboard/recurring", labelKey: "recurring", icon: RefreshCw },
  { href: "/dashboard/tax", labelKey: "tax", icon: Calculator },
  { href: "/dashboard/profile", labelKey: "profile", icon: UserCircle },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
  { href: "/dashboard/pricing", labelKey: "plan", icon: CreditCard },
  { href: "/dashboard/guide", labelKey: "guide", icon: BookOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [overdueCount, setOverdueCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { getPlanLabel, isPro, isTrial, trialDaysLeft, startTrial } = usePlan();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: t("theme", "light") },
    { value: "dark" as const, icon: Moon, label: t("theme", "dark") },
    { value: "system" as const, icon: Monitor, label: t("theme", "system") },
  ];

  useEffect(() => {
    const init = async () => {
      // Check Supabase auth first, then fallback to localStorage
      const user = await getCurrentUser();
      const localUser = localStorage.getItem("ff_user");

      if (!user && !localUser) {
        router.push("/login");
        return;
      }

      if (user) {
        const name = user.user_metadata?.name || user.email || "User";
        setUserName(name);
        localStorage.setItem("ff_user", JSON.stringify({ email: user.email, name, id: user.id }));
      } else if (localUser) {
        const parsed = JSON.parse(localUser);
        setUserName(parsed.name || parsed.email || "User");
      }

      // Process recurring transactions on app load
      processRecurringTransactions();

      // Check overdue invoices
      setOverdueCount(getOverdueInvoiceCount());

      // Sync from cloud if Supabase is configured
      if (isCloudEnabled()) {
        syncFromCloud();
      }

      // Show onboarding for new users
      if (!localStorage.getItem("ff_onboarding_done")) {
        setShowOnboarding(true);
      }
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("ff_onboarding_done");
    router.push("/");
  };

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="w-5 h-5" />
        {t("nav", item.labelKey)}
        {item.badge === "overdue" && overdueCount > 0 && (
          <span className="ml-auto bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {overdueCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed h-full">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <DollarSign className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold">Finlance</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {!isPro && (
          <div className="px-3 pb-2">
            <Link
              href="/dashboard/pricing"
              className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl text-sm font-medium text-primary hover:from-primary/15 hover:to-primary/10 transition"
            >
              <Sparkles className="w-4 h-4" />
              {t("nav", "upgradeToPro")}
            </Link>
          </div>
        )}

        {/* Notifications */}
        <div className="px-3 pb-2">
          <NotificationBell />
        </div>

        {/* Admin Link */}
        <div className="px-3 pb-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:text-foreground hover:bg-secondary transition"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Link>
        </div>

        {/* Language Toggle */}
        <div className="px-3 pb-2">
          <div className="flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setLocale("th")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition",
                locale === "th" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              TH
            </button>
            <button
              onClick={() => setLocale("en")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition",
                locale === "en" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              EN
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="px-3 pb-2">
          <div className="flex bg-secondary rounded-xl p-1">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition",
                  theme === opt.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
                title={opt.label}
              >
                <opt.icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/profile" className="truncate hover:opacity-80 transition">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className={`text-xs ${isPro ? "text-primary font-medium" : "text-muted"}`}>{getPlanLabel(locale)}</p>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-muted hover:text-danger rounded-lg hover:bg-secondary transition"
              title={t("nav", "logout")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <span className="font-bold">Finlance</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Mobile notifications */}
            <NotificationBell />
            {/* Mobile language toggle */}
            <button
              onClick={() => setLocale(locale === "th" ? "en" : "th")}
              className="p-1.5 rounded-lg transition text-muted hover:text-foreground"
              title={locale === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
            >
              <Languages className="w-4 h-4" />
            </button>
            {/* Mobile theme toggle - single cycle button on xs, all 3 on sm+ */}
            <div className="hidden sm:flex items-center">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "p-1.5 rounded-lg transition",
                    theme === opt.value ? "text-primary bg-primary/10" : "text-muted"
                  )}
                >
                  <opt.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
                setTheme(next);
              }}
              className="sm:hidden p-1.5 rounded-lg transition text-primary bg-primary/10"
            >
              {(() => { const Icon = themeOptions.find(o => o.value === theme)?.icon || Sun; return <Icon className="w-4 h-4" />; })()}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 ml-0.5">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="px-4 pb-4 space-y-1 bg-card border-b border-border max-h-[calc(100vh-56px)] overflow-y-auto">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-secondary transition w-full"
            >
              <LogOut className="w-5 h-5" />
              {t("nav", "logout")}
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        {/* Trial banner */}
        {isTrial && (
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-primary/20 px-4 py-2 text-center text-sm">
            <span className="text-primary font-medium">
              {t("plan", "trialBanner")} {trialDaysLeft} {t("plan", "daysLeft")}
            </span>
            <Link href="/dashboard/pricing" className="ml-2 text-xs text-primary underline hover:no-underline">
              {t("plan", "upgradeNow")}
            </Link>
          </div>
        )}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Feedback Button */}
      <FeedbackButton />

      {/* Onboarding */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartTrial={startTrial}
      />
    </div>
  );
}
