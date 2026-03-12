import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_PASSWORD = "finlance2026";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all auth users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Count totals
    const [txRes, clientRes, invoiceRes] = await Promise.all([
      supabaseAdmin.from("transactions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("invoices").select("id", { count: "exact", head: true }),
    ]);

    const totalUsers = users.length;
    const activeToday = users.filter(
      (u) => u.last_sign_in_at && u.last_sign_in_at.startsWith(todayStr)
    ).length;
    const signupsThisWeek = users.filter(
      (u) => u.created_at >= weekAgo
    ).length;

    // Signup activity by day (last 14 days)
    const activityByDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = users.filter((u) => u.created_at.startsWith(dateStr)).length;
      activityByDay.push({ date: dateStr, count });
    }

    const stats = {
      totalUsers,
      activeToday,
      freeUsers: totalUsers, // All free for now
      proUsers: 0,
      proYearlyUsers: 0,
      totalRevenue: 0,
      totalTransactions: txRes.count || 0,
      totalClients: clientRes.count || 0,
      totalInvoices: invoiceRes.count || 0,
      signupsThisWeek,
      eventsToday: activeToday,
    };

    // Plan distribution
    const planDistribution = [
      { name: "Free", value: totalUsers },
      { name: "Pro Monthly", value: 0 },
      { name: "Pro Yearly", value: 0 },
    ];

    // Recent signups as activity events
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);

    const recentEvents = recentUsers.map((u) => ({
      id: u.id,
      type: "signup" as const,
      userId: u.id,
      userEmail: u.email || "",
      userName: u.user_metadata?.name || u.email?.split("@")[0] || "",
      detail: `${u.user_metadata?.name || u.email} signed up`,
      createdAt: u.created_at,
    }));

    return NextResponse.json({
      stats,
      activityByDay,
      planDistribution,
      recentEvents,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
