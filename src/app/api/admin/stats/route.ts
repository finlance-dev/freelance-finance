import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "finlance2026";
  const auth = request.headers.get("x-admin-password");
  if (auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all auth users + activity log in parallel
    const [usersRes, txRes, clientRes, invoiceRes, activityRes] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin.from("transactions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("invoices").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    const { users } = usersRes.data;
    if (usersRes.error) {
      return NextResponse.json({ error: usersRes.error.message }, { status: 500 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const totalUsers = users.length;
    const activeToday = users.filter(
      (u) => u.last_sign_in_at && u.last_sign_in_at.startsWith(todayStr)
    ).length;
    const signupsThisWeek = users.filter(
      (u) => u.created_at >= weekAgo
    ).length;

    // Activity by day (last 14 days) — combine signups + activity_log events
    const activityByDay: { date: string; count: number }[] = [];
    const activityEvents = activityRes.data || [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const signupCount = users.filter((u) => u.created_at.startsWith(dateStr)).length;
      const eventCount = activityEvents.filter((e) => e.created_at?.startsWith(dateStr)).length;
      activityByDay.push({ date: dateStr, count: signupCount + eventCount });
    }

    const eventsToday = activityEvents.filter((e) => e.created_at?.startsWith(todayStr)).length;

    const stats = {
      totalUsers,
      activeToday,
      freeUsers: totalUsers,
      proUsers: 0,
      proYearlyUsers: 0,
      totalRevenue: 0,
      totalTransactions: txRes.count || 0,
      totalClients: clientRes.count || 0,
      totalInvoices: invoiceRes.count || 0,
      signupsThisWeek,
      eventsToday: eventsToday + activeToday,
    };

    const planDistribution = [
      { name: "Free", value: totalUsers },
      { name: "Pro Monthly", value: 0 },
      { name: "Pro Yearly", value: 0 },
    ];

    // Merge recent signups + activity_log events, sorted by time
    const signupEvents = users.map((u) => ({
      id: u.id,
      type: "signup" as const,
      userId: u.id,
      userEmail: u.email || "",
      userName: u.user_metadata?.name || u.email?.split("@")[0] || "",
      detail: `${u.user_metadata?.name || u.email} signed up`,
      createdAt: u.created_at,
    }));

    const dbEvents = activityEvents.map((e) => ({
      id: e.id,
      type: e.type,
      userId: e.user_id || "",
      userEmail: e.user_email || "",
      userName: e.user_name || "",
      detail: e.detail || "",
      createdAt: e.created_at,
    }));

    const recentEvents = [...signupEvents, ...dbEvents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30);

    return NextResponse.json({ stats, activityByDay, planDistribution, recentEvents });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
