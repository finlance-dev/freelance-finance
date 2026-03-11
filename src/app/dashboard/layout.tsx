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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { useTheme } from "@/components/theme-provider";
import { processRecurringTransactions, syncFromCloud, isCloudEnabled, getOverdueInvoiceCount } from "@/lib/store";
import { BarChart3 } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "รายการเงิน", icon: ArrowLeftRight },
  { href: "/dashboard/clients", label: "ลูกค้าและโปรเจกต์", icon: Users },
  { href: "/dashboard/invoices", label: "ใบแจ้งหนี้", icon: FileText, badge: "overdue" as const },
  { href: "/dashboard/reports", label: "รายงาน", icon: BarChart3 },
  { href: "/dashboard/recurring", label: "รายการประจำ", icon: RefreshCw },
  { href: "/dashboard/tax", label: "ประมาณภาษี", icon: Calculator },
  { href: "/dashboard/profile", label: "โปรไฟล์", icon: UserCircle },
  { href: "/dashboard/settings", label: "ตั้งค่า", icon: Settings },
  { href: "/dashboard/pricing", label: "แพลน", icon: CreditCard },
  { href: "/dashboard/guide", label: "คู่มือใช้งาน", icon: BookOpen },
];

const themeOptions = [
  { value: "light" as const, icon: Sun, label: "สว่าง" },
  { value: "dark" as const, icon: Moon, label: "มืด" },
  { value: "system" as const, icon: Monitor, label: "ระบบ" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [overdueCount, setOverdueCount] = useState(0);
  const { planLabel, isPro } = usePlan();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const user = localStorage.getItem("ff_user");
    if (!user) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(user);
    setUserName(parsed.name || parsed.email || "User");

    // Process recurring transactions on app load
    processRecurringTransactions();

    // Check overdue invoices
    setOverdueCount(getOverdueInvoiceCount());

    // Sync from cloud if Supabase is configured
    if (isCloudEnabled()) {
      syncFromCloud();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("ff_user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed h-full">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <DollarSign className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold">FreelanceFlow</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {"badge" in item && item.badge === "overdue" && overdueCount > 0 && (
                  <span className="ml-auto bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {overdueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {!isPro && (
          <div className="px-3 pb-2">
            <Link
              href="/dashboard/pricing"
              className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl text-sm font-medium text-primary hover:from-primary/15 hover:to-primary/10 transition"
            >
              <Sparkles className="w-4 h-4" />
              อัปเกรดเป็นโปร
            </Link>
          </div>
        )}

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
              <p className={`text-xs ${isPro ? "text-primary font-medium" : "text-muted"}`}>{planLabel}</p>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-muted hover:text-danger rounded-lg hover:bg-secondary transition"
              title="Logout"
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
            <span className="font-bold">FreelanceFlow</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Mobile theme toggle */}
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
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 ml-1">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="px-4 pb-4 space-y-1 bg-card border-b border-border">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {"badge" in item && item.badge === "overdue" && overdueCount > 0 && (
                    <span className="ml-auto bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {overdueCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-secondary transition w-full"
            >
              <LogOut className="w-5 h-5" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
