import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Admin auth
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }
  const auth = request.headers.get("x-admin-password");
  if (auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, action, note } = await request.json();

    if (!orderId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "rejected";

    const { data: order, error: fetchError } = await supabaseAdmin
      .from("payment_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const now = new Date();
    const updateData: Record<string, unknown> = {
      status,
      admin_note: note || null,
      updated_at: now.toISOString(),
    };

    // When approving, calculate plan expiry
    if (action === "approve") {
      const plan = order.plan as string;
      const expiresAt = plan === "pro_yearly"
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      updateData.plan_activated_at = now.toISOString();
      updateData.plan_expires_at = expiresAt.toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("payment_orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create referral commission if this user was referred
    if (action === "approve") {
      const COMMISSION_RATE = 0.25;
      const { data: referral } = await supabaseAdmin
        .from("referrals")
        .select("referrer_id")
        .eq("referred_id", order.user_id)
        .in("status", ["signed_up", "converted"])
        .limit(1)
        .single();

      if (referral) {
        const commissionAmount = Math.round(Number(order.amount) * COMMISSION_RATE);
        await supabaseAdmin.from("commissions").insert({
          referrer_id: referral.referrer_id,
          referred_id: order.user_id,
          order_id: orderId,
          amount: commissionAmount,
          rate: COMMISSION_RATE,
          status: "pending",
        });
        // Update referral status to converted
        await supabaseAdmin
          .from("referrals")
          .update({ status: "converted", converted_at: new Date().toISOString() })
          .eq("referred_id", order.user_id)
          .eq("referrer_id", referral.referrer_id);
      }
    }

    return NextResponse.json({ success: true, status, orderId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Get all payment orders (admin)
export async function GET(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }
  const auth = request.headers.get("x-admin-password");
  if (auth !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") || "pending";

  const { data, error } = await supabaseAdmin
    .from("payment_orders")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
