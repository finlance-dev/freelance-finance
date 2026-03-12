"use client";

import { useState, useEffect } from "react";
import {
  Activity, UserPlus, LogIn, LogOut, Crown, Plus, Trash2, FileText,
  Download, Upload, Settings, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";
import { fetchAdminStats } from "@/lib/admin-store";
import type { ActivityEvent } from "@/lib/types";

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
  return new Date(dateStr).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminActivityPage() {
  const { locale } = useLocale();
  const [allEvents, setAllEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminStats()
      .then((data) => setAllEvents(data.recentEvents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-danger">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{locale === "th" ? "บันทึกกิจกรรม" : "Activity Log"}</h1>
        <p className="text-sm text-muted mt-1">
          {locale === "th" ? `${allEvents.length} กิจกรรม (จาก Supabase)` : `${allEvents.length} events (from Supabase)`}
        </p>
      </div>

      {/* Event List */}
      {allEvents.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {allEvents.map((evt) => {
            const config = eventConfig[evt.type] || { icon: Activity, color: "text-muted", th: evt.type, en: evt.type };
            const Icon = config.icon;
            return (
              <div key={evt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-secondary shrink-0", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{evt.userName || evt.userEmail || "—"}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", config.color)}>
                      {locale === "th" ? config.th : config.en}
                    </span>
                  </div>
                  {evt.detail && <p className="text-xs text-muted truncate mt-0.5">{evt.detail}</p>}
                </div>
                <span className="text-xs text-muted whitespace-nowrap shrink-0">
                  {relativeTime(evt.createdAt, locale)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-muted">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {locale === "th" ? "ยังไม่มีกิจกรรม" : "No activity yet"}
          </p>
          <p className="text-xs mt-1">
            {locale === "th" ? "กิจกรรมจะปรากฏเมื่อผู้ใช้เริ่มใช้งานระบบ" : "Activity will appear when users start using the system"}
          </p>
        </div>
      )}
    </div>
  );
}
