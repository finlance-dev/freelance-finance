"use client";

import { useState, useEffect } from "react";
import { Users, Search, Crown, ArrowLeftRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";
import { fetchAllUsers } from "@/lib/admin-store";
import type { AdminUser } from "@/lib/types";

const planBadge: Record<string, { label: string; labelEn: string; cls: string }> = {
  free: { label: "Free", labelEn: "Free", cls: "bg-secondary text-muted" },
  pro: { label: "Pro", labelEn: "Pro", cls: "bg-primary/10 text-primary" },
  pro_yearly: { label: "Pro ปี", labelEn: "Pro Yearly", cls: "bg-purple-500/10 text-purple-400" },
};

export default function AdminUsersPage() {
  const { locale } = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-secondary rounded-2xl animate-pulse" />
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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{locale === "th" ? "ผู้ใช้งานทั้งหมด" : "All Users"}</h1>
        <p className="text-sm text-muted mt-1">
          {locale === "th" ? `${users.length} ผู้ใช้ (Supabase)` : `${users.length} users (Supabase)`}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale === "th" ? "ค้นหาชื่อหรืออีเมล..." : "Search name or email..."}
          className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* User List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((user) => {
            const badge = planBadge[user.plan] || planBadge.free;
            return (
              <div key={user.email} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", badge.cls)}>
                          {locale === "th" ? badge.label : badge.labelEn}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-muted" />
                      <span className="text-muted">{locale === "th" ? "รายการ" : "Txn"}:</span>
                      <span className="font-semibold">{user.transactionCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted" />
                      <span className="text-muted">{locale === "th" ? "ลูกค้า" : "Clients"}:</span>
                      <span className="font-semibold">{user.clientCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted" />
                      <span className="text-muted">{locale === "th" ? "ใบแจ้งหนี้" : "Invoices"}:</span>
                      <span className="font-semibold">{user.invoiceCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-accent" />
                      <span className="text-muted">{locale === "th" ? "รายได้" : "Income"}:</span>
                      <span className="font-semibold text-accent">฿{user.totalIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mt-3 pt-3 border-t border-border text-xs text-muted">
                  <span>
                    {locale === "th" ? "สมัคร" : "Joined"}: {new Date(user.signupDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  <span>
                    {locale === "th" ? "ใช้งานล่าสุด" : "Last active"}: {new Date(user.lastActive).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {search
              ? locale === "th" ? "ไม่พบผู้ใช้ที่ตรงกับการค้นหา" : "No users match your search"
              : locale === "th" ? "ยังไม่มีผู้ใช้" : "No users yet"}
          </p>
        </div>
      )}
    </div>
  );
}
