import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — Verify a referral code is valid
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ valid: false });
  }

  const { data } = await supabaseAdmin
    .from("referrals")
    .select("referrer_id, referral_code")
    .eq("referral_code", code.toUpperCase())
    .limit(1)
    .single();

  if (!data) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, code: data.referral_code });
}

// POST — Record that a referred user signed up
export async function POST(request: NextRequest) {
  try {
    const { code, referredId, referredEmail } = await request.json();

    if (!code || !referredId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find the referral record
    const { data: referral } = await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referral_code", code.toUpperCase())
      .limit(1)
      .single();

    if (!referral) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }

    // Don't let users refer themselves
    if (referral.referrer_id === referredId) {
      return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
    }

    // Check if this user was already referred
    const { data: existing } = await supabaseAdmin
      .from("referrals")
      .select("id")
      .eq("referred_id", referredId)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already referred" }, { status: 409 });
    }

    // Create a new referral record for this specific referred user
    const { error } = await supabaseAdmin
      .from("referrals")
      .insert({
        referrer_id: referral.referrer_id,
        referral_code: referral.referral_code,
        referred_id: referredId,
        referred_email: referredEmail || null,
        status: "signed_up",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
