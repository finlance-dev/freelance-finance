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
    // Fetch all data in parallel (batch — no N+1)
    const [usersRes, txRes, clientRes, invoiceRes] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin.from("transactions").select("user_id, type, amount"),
      supabaseAdmin.from("clients").select("user_id"),
      supabaseAdmin.from("invoices").select("user_id"),
    ]);

    if (usersRes.error) {
      return NextResponse.json({ error: usersRes.error.message }, { status: 500 });
    }

    const { users } = usersRes.data;
    const transactions = txRes.data || [];
    const clients = clientRes.data || [];
    const invoices = invoiceRes.data || [];

    // Group by user_id in memory
    const txByUser = new Map<string, { count: number; income: number; expenses: number }>();
    for (const t of transactions) {
      const uid = t.user_id;
      if (!txByUser.has(uid)) txByUser.set(uid, { count: 0, income: 0, expenses: 0 });
      const entry = txByUser.get(uid)!;
      entry.count++;
      if (t.type === "income") entry.income += Number(t.amount);
      else entry.expenses += Number(t.amount);
    }

    const clientByUser = new Map<string, number>();
    for (const c of clients) {
      clientByUser.set(c.user_id, (clientByUser.get(c.user_id) || 0) + 1);
    }

    const invoiceByUser = new Map<string, number>();
    for (const i of invoices) {
      invoiceByUser.set(i.user_id, (invoiceByUser.get(i.user_id) || 0) + 1);
    }

    const adminUsers = users.map((user) => {
      const uid = user.id;
      const tx = txByUser.get(uid) || { count: 0, income: 0, expenses: 0 };
      return {
        email: user.email || "",
        name: user.user_metadata?.name || (user.email || "").split("@")[0],
        plan: "free" as const,
        signupDate: user.created_at,
        lastActive: user.last_sign_in_at || user.created_at,
        transactionCount: tx.count,
        clientCount: clientByUser.get(uid) || 0,
        invoiceCount: invoiceByUser.get(uid) || 0,
        totalIncome: tx.income,
        totalExpenses: tx.expenses,
      };
    });

    return NextResponse.json({ users: adminUsers });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
