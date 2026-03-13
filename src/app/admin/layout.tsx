"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Users, Activity, LogOut, Lock, Eye, EyeOff, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import { useLocale } from "@/hooks/useLocale";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, mounted, login, logout } = useAdmin();
  const { locale } = useLocale();
  const pathname = usePathname();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">Finlance Admin</h1>
          </div>
          <p className="text-sm text-muted text-center mb-6">
            {locale === "th" ? "กรุณาใส่รหัสผ่านผู้ดูแลระบบ" : "Enter admin password"}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await login(password);
              if (!ok) {
                setError(true);
                setTimeout(() => setError(false), 2000);
              }
            }}
          >
            <div className="relative mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={locale === "th" ? "รหัสผ่าน" : "Password"}
                className={cn(
                  "w-full pl-10 pr-10 py-3 bg-secondary border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary",
                  error ? "border-danger" : "border-border"
                )}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-danger text-xs mb-3 text-center">
                {locale === "th" ? "รหัสผ่านไม่ถูกต้อง" : "Incorrect password"}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition"
            >
              {locale === "th" ? "เข้าสู่ระบบ" : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/dashboard" className="text-xs text-muted hover:text-foreground">
              ← {locale === "th" ? "กลับไปแดชบอร์ด" : "Back to dashboard"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { href: "/admin", label: locale === "th" ? "ภาพรวม" : "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: locale === "th" ? "ผู้ใช้งาน" : "Users", icon: Users },
    { href: "/admin/activity", label: locale === "th" ? "กิจกรรม" : "Activity", icon: Activity },
    { href: "/admin/payments", label: locale === "th" ? "การชำระเงิน" : "Payments", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-sm sm:text-base">Finlance Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-xs text-muted hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition"
              >
                {locale === "th" ? "แดชบอร์ด" : "Dashboard"}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                {locale === "th" ? "ออก" : "Logout"}
              </button>
            </div>
          </div>
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== "/admin" && pathname.startsWith(tab.href));
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
