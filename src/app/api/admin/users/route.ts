import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_PASSWORD = "finlance2026";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all auth users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to AdminUser format
    const adminUsers = await Promise.all(
      users.map(async (user) => {
        const userId = user.id;
        const email = user.email || "";
        const name = user.user_metadata?.name || email.split("@")[0];

        // Count user's data
        const [txRes, clientRes, invoiceRes] = await Promise.all([
          supabaseAdmin.from("transactions").select("type, amount", { count: "exact" }).eq("user_id", userId),
          supabaseAdmin.from("clients").select("id", { count: "exact" }).eq("user_id", userId),
          supabaseAdmin.from("invoices").select("id", { count: "exact" }).eq("user_id", userId),
        ]);

        const transactions = txRes.data || [];
        const totalIncome = transactions
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + Number(t.amount), 0);
        const totalExpenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + Number(t.amount), 0);

        return {
          email,
          name,
          plan: "free" as const,
          signupDate: user.created_at,
          lastActive: user.last_sign_in_at || user.created_at,
          transactionCount: txRes.count || 0,
          clientCount: clientRes.count || 0,
          invoiceCount: invoiceRes.count || 0,
          totalIncome,
          totalExpenses,
        };
      })
    );

    return NextResponse.json({ users: adminUsers });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
