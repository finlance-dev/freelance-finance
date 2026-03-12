import type { AdminUser, ActivityEvent } from "./types";

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  freeUsers: number;
  proUsers: number;
  proYearlyUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  totalClients: number;
  totalInvoices: number;
  signupsThisWeek: number;
  eventsToday: number;
}

interface StatsResponse {
  stats: AdminStats;
  activityByDay: { date: string; count: number }[];
  planDistribution: { name: string; value: number }[];
  recentEvents: ActivityEvent[];
}

function getAdminPassword(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("ff_admin_password") || "";
}

// ─── Cloud-based admin data (fetches from Supabase via API routes) ────────

export async function fetchAdminStats(): Promise<StatsResponse> {
  const res = await fetch("/api/admin/stats", {
    headers: { "x-admin-password": getAdminPassword() },
  });
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/users", {
    headers: { "x-admin-password": getAdminPassword() },
  });
  if (!res.ok) throw new Error("Failed to fetch admin users");
  const data = await res.json();
  return data.users;
}
