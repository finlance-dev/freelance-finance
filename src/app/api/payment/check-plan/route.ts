import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ plan: "free" });
  }

  // Find the latest approved order that hasn't expired
  const { data, error } = await supabaseAdmin
    .from("payment_orders")
    .select("plan, plan_activated_at, plan_expires_at")
    .eq("user_id", userId)
    .eq("status", "approved")
    .not("plan_expires_at", "is", null)
    .gte("plan_expires_at", new Date().toISOString())
    .order("plan_expires_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ plan: "free", activatedAt: null, expiresAt: null });
  }

  return NextResponse.json({
    plan: data.plan,
    activatedAt: data.plan_activated_at,
    expiresAt: data.plan_expires_at,
  });
}
