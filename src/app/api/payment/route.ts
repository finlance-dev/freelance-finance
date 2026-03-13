import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";

// Create a payment order
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { userId, userEmail, userName, plan, amount } = body;

    if (!userId || !userEmail || !plan || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!["pro", "pro_yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Check for existing pending order
    const { data: existing } = await supabaseAdmin
      .from("payment_orders")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json({ error: "pending_exists", orderId: existing.id }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from("payment_orders")
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        plan,
        amount,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orderId: data.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Get user's payment orders
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("payment_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
