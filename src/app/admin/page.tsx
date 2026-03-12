"use client";

import { useState, useEffect } from "react";
import {
  Users, Activity, Crown, DollarSign, TrendingUp, UserPlus, LogIn, LogOut,
  Plus, Trash2, FileText, Download, Upload, Settings, Eye,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";
import { getAdminStats, getActivityByDay, getPlanDistribution, type AdminStats } from "@/lib/admin-store";
import { getActivityLog } from "@/lib/activity-logger";
import type { ActivityEvent, ActivityEventType } from "@/lib/types";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const eventConfig: Record<string, { icon: React.ElementType; color: string; th: string; en: string }> = {
  signup: { icon: UserPlus, color: "text-accent", th: "สมัครสมาชิก", en: "Signed up" },
  login: { icon: LogIn, color: "text-primary", th: "เข้าสู่ระบบ", en: "Logged in" },
  logout: { icon: LogOut, color: "text-muted", th: "ออกจากระบบ", en: "Logged out" },
  plan_change: { icon: Crown, color: "text-warning", th: "เปลี่ยนแพลน", en: "Changed plan" },
  transaction_create: { icon: Plus, color: "text-accent", th: "สร้างรายการ", en: "Created transaction" },
  transaction_delete: { icon: Trash2, color: "text-danger", th: "ลบรายการ", en: "Deleted transaction" },
  client_create: { icon: UserPlus, color: "text-primary", th: "เพิ่มลูกค้า", en: "Added client" },
  client_delete: { icon: Trash2, color: "text-danger", th: "ลบลูกค้า", en: "Deleted client" },
  invoice_create: { icon: FileText, color: "text-primary", th: "สร้างใบแจ้งหนี้", en: "Created invoice" },
  invoice_update: { icon: FileText, color: "text-warning", th: "อัพเดทใบแจ้งหนี้", en: "Updated invoice" },
  data_export: { icon: Download, color: "text-primary", th: "ส่งออกข้อมูล", en: "Exported data" },
  data_import: { icon: Upload, color: "text-accent", th: "นำเข้าข้อมูล", en: "Imported data" },
  settings_change: { icon: Settings, color: "text-muted", th: "เปลี่ยนการตั้งค่า", en: "Changed settings" },
  page_view: { icon: Eye, color: "text-muted", th: "ดูหน้า", en: "Viewed page" },
  recurring_create: { icon: Plus, color: "text-accent", th: "สร้างรายการประจำ", en: "Created recurring" },
  recurring_delete: { icon: Trash2, color: "text-danger", th: "ลบรายการประจำ", en: "Deleted recurring" },
};

function relativeTime(dateStr: string, locale: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return locale === "th" ? "เมื่อกี้" : "Just now";
  if (mins < 60) return locale === "th" ? `${mins} นาทีที่แล้ว` : `${mins}m ago`;
  if (hours < 24) return locale === "th" ? `${hours} ชั่วโมงที่แล้ว` : `${hours}h ago`;
  if (days < 7) return locale === "th" ? `${days} วันที่แล้ว` : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short", day: "numeric" });
}

export default function AdminOverviewPage() {
  const { locale } = useLocale();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const [planData, setPlanData] = useState<{ name: string; value: number }[]>([]);
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setStats(getAdminStats());
    setActivityData(getActivityByDay(14));
    setPlanData(getPlanDistribution());
    setRecentEvents(getActivityLog().slice(0, 20));
  }, []);

  if (!stats) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-secondary rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: locale === "th" ? "ผู้ใช้ทั้งหมด" : "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: locale === "th" ? "ใช้งานวันนี้" : "Active Today", value: stats.activeToday, icon: Activity, color: "text-accent" },
    { label: locale === "th" ? "ผู้ใช้ Free" : "Free Users", value: stats.freeUsers, icon: Users, color: "text-muted" },
    { label: locale === "th" ? "ผู้ใช้ Pro รายเดือน" : "Pro Monthly", value: stats.proUsers, icon: Crown, color: "text-warning" },
    { label: locale === "th" ? "ผู้ใช้ Pro รายปี" : "Pro Yearly", value: stats.proYearlyUsers, icon: Crown, color: "text-purple-400" },
    { label: locale === "th" ? "รายได้รวม" : "Total Revenue", value: `฿${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
  ];

  const secondaryStats = [
    { label: locale === "th" ? "รายการทั้งหมด" : "Transactions", value: stats.totalTransactions },
    { label: locale === "th" ? "ลูกค้าทั้งหมด" : "Clients", value: stats.totalClients },
    { label: locale === "th" ? "ใบแจ้งหนี้" : "Invoices", value: stats.totalInvoices },
    { label: locale === "th" ? "สมัครสัปดาห์นี้" : "Signups This Week", value: stats.signupsThisWeek },
    { label: locale === "th" ? "กิจกรรมวันนี้" : "Events Today", value: stats.eventsToday },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{locale === "th" ? "ภาพรวมระบบ" : "System Overview"}</h1>
        <p className="text-sm text-muted mt-1">{locale === "th" ? "ข้อมูลผู้ใช้งานและกิจกรรมทั้งหมด" : "All user data and activity"}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted font-medium">{card.label}</span>
                <Icon className={cn("w-5 h-5", card.color)} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="flex flex-wrap gap-3">
        {secondaryStats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-xs text-muted">{s.label}:</span>
            <span className="text-sm font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {locale === "th" ? "กิจกรรม 14 วันล่าสุด" : "Activity (Last 14 Days)"}
          </h3>
          {activityData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="#64748b" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  labelFormatter={(v) => v}
                  formatter={(v) => [String(v), locale === "th" ? "กิจกรรม" : "Events"]}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#actGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted text-sm">
              {locale === "th" ? "ยังไม่มีข้อมูล" : "No data yet"}
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-warning" />
            {locale === "th" ? "สัดส่วนแพลน" : "Plan Distribution"}
          </h3>
          {planData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                    {planData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {planData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm">{d.name}</span>
                    <span className="text-sm font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted text-sm">
              {locale === "th" ? "ยังไม่มีข้อมูล" : "No data yet"}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          {locale === "th" ? "กิจกรรมล่าสุด" : "Recent Activity"}
        </h3>
        {recentEvents.length > 0 ? (
          <div className="space-y-1">
            {recentEvents.map((evt) => {
              const config = eventConfig[evt.type] || { icon: Activity, color: "text-muted", th: evt.type, en: evt.type };
              const Icon = config.icon;
              return (
                <div key={evt.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-secondary/50 transition">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-secondary shrink-0", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-medium">{evt.userName || evt.userEmail}</span>
                      {" — "}
                      <span className="text-muted">{locale === "th" ? config.th : config.en}</span>
                    </p>
                    {evt.detail && <p className="text-xs text-muted truncate">{evt.detail}</p>}
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap shrink-0">
                    {relativeTime(evt.createdAt, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{locale === "th" ? "ยังไม่มีกิจกรรม" : "No activity yet"}</p>
            <p className="text-xs mt-1">{locale === "th" ? "กิจกรรมจะปรากฏเมื่อผู้ใช้เริ่มใช้งาน" : "Activity will appear when users start using the app"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
