import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, invoiceOverdueEmail, planExpiringEmail } from "@/lib/email";

// Cron-friendly endpoint to send email notifications
// Call daily via Vercel Cron or external cron service
export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const auth = request.headers.get("x-admin-password");
  if (auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { type: string; user: string; success: boolean }[] = [];
  const today = new Date().toISOString().split("T")[0];

  // 1. Check overdue invoices
  const { data: overdueInvoices } = await supabaseAdmin
    .from("invoices")
    .select("user_id, invoice_number")
    .or(`status.eq.overdue,and(status.eq.sent,due_date.lt.${today})`);

  if (overdueInvoices?.length) {
    // Group by user
    const byUser = new Map<string, string[]>();
    for (const inv of overdueInvoices) {
      const list = byUser.get(inv.user_id) || [];
      list.push(inv.invoice_number);
      byUser.set(inv.user_id, list);
    }

    for (const [userId, invoiceNumbers] of byUser) {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (user?.user?.email) {
        const { subject, html } = invoiceOverdueEmail(invoiceNumbers, invoiceNumbers.length);
        const result = await sendEmail(user.user.email, subject, html);
        results.push({ type: "invoice_overdue", user: user.user.email, success: result.success });
      }
    }
  }

  // 2. Check expiring plans (within 3 days)
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: expiringOrders } = await supabaseAdmin
    .from("payment_orders")
    .select("user_id, user_email, plan_expires_at")
    .eq("status", "approved")
    .not("plan_expires_at", "is", null)
    .lte("plan_expires_at", threeDaysLater)
    .gte("plan_expires_at", new Date().toISOString());

  if (expiringOrders?.length) {
    for (const order of expiringOrders) {
      if (order.user_email) {
        const daysLeft = Math.max(1, Math.ceil((new Date(order.plan_expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
        const { subject, html } = planExpiringEmail(daysLeft);
        const result = await sendEmail(order.user_email, subject, html);
        results.push({ type: "plan_expiring", user: order.user_email, success: result.success });
      }
    }
  }

  return NextResponse.json({ sent: results.length, results });
}
