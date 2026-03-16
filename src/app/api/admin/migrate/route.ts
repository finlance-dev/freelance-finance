import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }
  const auth = request.headers.get("x-admin-password");
  if (auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { step: string; success: boolean; error?: string }[] = [];

  // Add plan_activated_at column
  const { error: err1 } = await supabaseAdmin.rpc("exec_sql", {
    sql: "ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ",
  });

  if (err1) {
    // Try direct approach - just attempt an update to test if column exists
    const { error: testErr } = await supabaseAdmin
      .from("payment_orders")
      .update({ plan_activated_at: null })
      .eq("id", "00000000-0000-0000-0000-000000000000");

    if (testErr && testErr.message.includes("plan_activated_at")) {
      results.push({ step: "add plan_activated_at", success: false, error: "Column doesn't exist and RPC not available. Please run SQL manually." });
    } else {
      results.push({ step: "add plan_activated_at", success: true, error: "Column already exists or was added" });
    }
  } else {
    results.push({ step: "add plan_activated_at", success: true });
  }

  // Add plan_expires_at column
  const { error: err2 } = await supabaseAdmin.rpc("exec_sql", {
    sql: "ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ",
  });

  if (err2) {
    const { error: testErr } = await supabaseAdmin
      .from("payment_orders")
      .update({ plan_expires_at: null })
      .eq("id", "00000000-0000-0000-0000-000000000000");

    if (testErr && testErr.message.includes("plan_expires_at")) {
      results.push({ step: "add plan_expires_at", success: false, error: "Column doesn't exist and RPC not available. Please run SQL manually." });
    } else {
      results.push({ step: "add plan_expires_at", success: true, error: "Column already exists or was added" });
    }
  } else {
    results.push({ step: "add plan_expires_at", success: true });
  }

  return NextResponse.json({ results });
}
