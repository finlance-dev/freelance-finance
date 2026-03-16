import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function checkAdmin(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return request.headers.get("x-admin-password") === adminPassword;
}

// GET — List withdrawals
export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") || "pending";

  const { data, error } = await supabaseAdmin
    .from("withdrawals")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ withdrawals: data });
}

// POST — Approve/reject/mark paid
export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { withdrawalId, action, note } = await request.json();

    if (!withdrawalId || !["approve", "reject", "paid"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: action === "approve" ? "approved" : action,
      admin_note: note || null,
    };

    if (action === "paid") {
      updateData.processed_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("withdrawals")
      .update(updateData)
      .eq("id", withdrawalId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If paid, update related commissions
    if (action === "paid") {
      const { data: withdrawal } = await supabaseAdmin
        .from("withdrawals")
        .select("user_id, amount")
        .eq("id", withdrawalId)
        .single();

      if (withdrawal) {
        await supabaseAdmin
          .from("commissions")
          .update({ status: "paid" })
          .eq("referrer_id", withdrawal.user_id)
          .eq("status", "pending");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
