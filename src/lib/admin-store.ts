import { AdminUser } from "./types";
import { getActivityLog } from "./activity-logger";

export function getAllUsers(): AdminUser[] {
  const events = getActivityLog();
  const userMap = new Map<string, AdminUser>();

  for (const evt of events) {
    if (!evt.userEmail) continue;

    if (!userMap.has(evt.userEmail)) {
      userMap.set(evt.userEmail, {
        email: evt.userEmail,
        name: evt.userName || evt.userEmail,
        plan: "free",
        signupDate: evt.createdAt,
        lastActive: evt.createdAt,
        transactionCount: 0,
        clientCount: 0,
        invoiceCount: 0,
        totalIncome: 0,
        totalExpenses: 0,
      });
    }

    const user = userMap.get(evt.userEmail)!;
    if (evt.createdAt > user.lastActive) user.lastActive = evt.createdAt;
    if (evt.createdAt < user.signupDate) user.signupDate = evt.createdAt;

    if (evt.type === "transaction_create") {
      user.transactionCount++;
      if (evt.metadata?.type === "income") user.totalIncome += (evt.metadata?.amount as number) || 0;
      if (evt.metadata?.type === "expense") user.totalExpenses += (evt.metadata?.amount as number) || 0;
    }
    if (evt.type === "client_create") user.clientCount++;
    if (evt.type === "invoice_create") user.invoiceCount++;
    if (evt.type === "plan_change") user.plan = (evt.metadata?.plan as AdminUser["plan"]) || "free";
  }

  // Enrich with current localStorage data
  if (typeof window !== "undefined") {
    try {
      const currentUser = JSON.parse(localStorage.getItem("ff_user") || "{}");
      const currentPlan = JSON.parse(localStorage.getItem("ff_user_plan") || "{}");
      const transactions = JSON.parse(localStorage.getItem("ff_transactions") || "[]");
      const clients = JSON.parse(localStorage.getItem("ff_clients") || "[]");
      const invoices = JSON.parse(localStorage.getItem("ff_invoices") || "[]");

      if (currentUser.email) {
        const existing = userMap.get(currentUser.email);
        const income = transactions
          .filter((t: { type: string }) => t.type === "income")
          .reduce((s: number, t: { amount: number }) => s + t.amount, 0);
        const expenses = transactions
          .filter((t: { type: string }) => t.type === "expense")
          .reduce((s: number, t: { amount: number }) => s + t.amount, 0);

        userMap.set(currentUser.email, {
          email: currentUser.email,
          name: currentUser.name || existing?.name || currentUser.email,
          plan: currentPlan.plan || existing?.plan || "free",
          signupDate: existing?.signupDate || currentUser.createdAt || new Date().toISOString(),
          lastActive: new Date().toISOString(),
          transactionCount: transactions.length,
          clientCount: clients.length,
          invoiceCount: invoices.length,
          totalIncome: income,
          totalExpenses: expenses,
        });
      }
    } catch {
      // ignore
    }
  }

  return Array.from(userMap.values()).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );
}

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  proUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  totalClients: number;
  totalInvoices: number;
  signupsThisWeek: number;
  eventsToday: number;
}

export function getAdminStats(): AdminStats {
  const users = getAllUsers();
  const events = getActivityLog();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    totalUsers: users.length,
    activeToday: events
      .filter((e) => e.createdAt.startsWith(todayStr))
      .map((e) => e.userEmail)
      .filter((v, i, a) => a.indexOf(v) === i).length,
    proUsers: users.filter((u) => u.plan === "pro" || u.plan === "pro_yearly").length,
    totalRevenue: users.reduce((s, u) => s + u.totalIncome, 0),
    totalTransactions: users.reduce((s, u) => s + u.transactionCount, 0),
    totalClients: users.reduce((s, u) => s + u.clientCount, 0),
    totalInvoices: users.reduce((s, u) => s + u.invoiceCount, 0),
    signupsThisWeek: events.filter((e) => e.type === "signup" && e.createdAt >= weekAgo).length,
    eventsToday: events.filter((e) => e.createdAt.startsWith(todayStr)).length,
  };
}

export function getActivityByDay(days: number = 14): { date: string; count: number }[] {
  const events = getActivityLog();
  const now = new Date();
  const result: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = events.filter((e) => e.createdAt.startsWith(dateStr)).length;
    result.push({ date: dateStr, count });
  }

  return result;
}

export function getPlanDistribution(): { name: string; value: number }[] {
  const users = getAllUsers();
  const free = users.filter((u) => u.plan === "free").length;
  const pro = users.filter((u) => u.plan === "pro").length;
  const proYearly = users.filter((u) => u.plan === "pro_yearly").length;

  return [
    { name: "Free", value: free },
    { name: "Pro Monthly", value: pro },
    { name: "Pro Yearly", value: proYearly },
  ].filter((d) => d.value > 0);
}
