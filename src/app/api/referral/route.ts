import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";

const COMMISSION_RATE = 0.25; // 25%

// Generate a short unique referral code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET — Get or create referral code + stats for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Get or create referral code
  let { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("referral_code")
    .eq("referrer_id", userId)
    .limit(1)
    .single();

  if (!referral) {
    // Create a new referral code
    let code = generateCode();
    // Ensure uniqueness
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabaseAdmin
        .from("referrals")
        .select("id")
        .eq("referral_code", code)
        .single();
      if (!existing) break;
      code = generateCode();
    }

    const { data: newRef, error } = await supabaseAdmin
      .from("referrals")
      .insert({ referrer_id: userId, referral_code: code, status: "pending" })
      .select("referral_code")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    referral = newRef;
  }

  // Get stats
  const { count: totalReferred } = await supabaseAdmin
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", userId)
    .in("status", ["signed_up", "converted", "rewarded"]);

  const { count: totalConverted } = await supabaseAdmin
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", userId)
    .in("status", ["converted", "rewarded"]);

  // Get commission totals
  const { data: commissions } = await supabaseAdmin
    .from("commissions")
    .select("amount, status")
    .eq("referrer_id", userId);

  const totalEarned = (commissions || []).reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingAmount = (commissions || []).filter(c => c.status === "pending").reduce((sum, c) => sum + Number(c.amount), 0);
  const paidAmount = (commissions || []).filter(c => c.status === "paid").reduce((sum, c) => sum + Number(c.amount), 0);

  // Get withdrawal history
  const { data: withdrawals } = await supabaseAdmin
    .from("withdrawals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    code: referral?.referral_code,
    stats: {
      totalReferred: totalReferred || 0,
      totalConverted: totalConverted || 0,
      totalEarned,
      pendingAmount,
      paidAmount,
      availableToWithdraw: totalEarned - paidAmount - pendingAmount,
    },
    withdrawals: withdrawals || [],
    commissionRate: COMMISSION_RATE,
  });
}

// POST — Request withdrawal
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { userId, amount, promptpayId } = await request.json();

    if (!userId || !amount || !promptpayId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (amount < 500) {
      return NextResponse.json({ error: "ยอดถอนขั้นต่ำ ฿500" }, { status: 400 });
    }

    // Verify available balance
    const { data: commissions } = await supabaseAdmin
      .from("commissions")
      .select("amount, status")
      .eq("referrer_id", userId);

    const totalEarned = (commissions || []).reduce((sum, c) => sum + Number(c.amount), 0);
    const paidOrPending = (commissions || []).filter(c => c.status !== "pending").reduce((sum, c) => sum + Number(c.amount), 0);

    // Check pending withdrawals
    const { data: pendingWithdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("amount")
      .eq("user_id", userId)
      .in("status", ["pending", "approved"]);

    const withdrawnOrPending = (pendingWithdrawals || []).reduce((sum, w) => sum + Number(w.amount), 0);
    const available = totalEarned - paidOrPending - withdrawnOrPending;

    if (amount > available) {
      return NextResponse.json({ error: "ยอดเงินไม่เพียงพอ" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: userId,
        amount,
        promptpay_id: promptpayId,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, withdrawalId: data.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
