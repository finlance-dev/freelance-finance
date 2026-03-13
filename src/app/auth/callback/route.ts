import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next") || "/dashboard";
  // Prevent open redirect — only allow relative paths starting with /
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", request.url));
      }
      // For email verification or other types, redirect to next page
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
