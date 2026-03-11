import { Client, Project, Transaction, UserPlan, PlanType, IncomeGoal, Invoice } from "./types";
import type { RecurringTransaction } from "./types";
import { supabase } from "./supabase";

const STORAGE_KEYS = {
  clients: "ff_clients",
  projects: "ff_projects",
  transactions: "ff_transactions",
  taxRate: "ff_tax_rate",
  monthlyExpenses: "ff_monthly_expenses",
  userPlan: "ff_user_plan",
  recurring: "ff_recurring",
  currency: "ff_currency",
  incomeGoal: "ff_income_goal",
  invoices: "ff_invoices",
  categories: "ff_categories",
};

// ─── Helpers ────────────────────────────────────────────────────────────

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
}

function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url !== "" && url !== "your_supabase_url_here";
}

async function getSupabaseUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch {
    return null;
  }
}

// ─── Clients ────────────────────────────────────────────────────────────

export function getClients(): Client[] {
  return getItem(STORAGE_KEYS.clients, []);
}

export function saveClient(client: Client) {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) clients[idx] = client;
  else clients.push(client);
  setItem(STORAGE_KEYS.clients, clients);

  // Background sync to Supabase
  getSupabaseUserId().then((userId) => {
    if (!userId) return;
    supabase.from("clients").upsert({
      id: client.id, user_id: userId,
      name: client.name, email: client.email, color: client.color,
    }).then(() => {});
  });
}

export function deleteClient(id: string) {
  setItem(STORAGE_KEYS.clients, getClients().filter((c) => c.id !== id));
  if (isSupabaseConfigured()) {
    supabase.from("clients").delete().eq("id", id).then(() => {});
  }
}

// ─── Projects ───────────────────────────────────────────────────────────

export function getProjects(): Project[] {
  return getItem(STORAGE_KEYS.projects, []);
}

export function saveProject(project: Project) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  setItem(STORAGE_KEYS.projects, projects);

  getSupabaseUserId().then((userId) => {
    if (!userId) return;
    supabase.from("projects").upsert({
      id: project.id, user_id: userId,
      client_id: project.clientId, name: project.name,
      status: project.status, hourly_rate: project.hourlyRate,
    }).then(() => {});
  });
}

export function deleteProject(id: string) {
  setItem(STORAGE_KEYS.projects, getProjects().filter((p) => p.id !== id));
  if (isSupabaseConfigured()) {
    supabase.from("projects").delete().eq("id", id).then(() => {});
  }
}

// ─── Transactions ───────────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  return getItem(STORAGE_KEYS.transactions, []);
}

export function saveTransaction(tx: Transaction) {
  const transactions = getTransactions();
  const idx = transactions.findIndex((t) => t.id === tx.id);
  if (idx >= 0) transactions[idx] = tx;
  else transactions.push(tx);
  setItem(STORAGE_KEYS.transactions, transactions);

  getSupabaseUserId().then((userId) => {
    if (!userId) return;
    supabase.from("transactions").upsert({
      id: tx.id, user_id: userId,
      project_id: tx.projectId, client_id: tx.clientId,
      type: tx.type, amount: tx.amount, date: tx.date,
      description: tx.description, category: tx.category,
      currency: tx.currency || "THB",
    }).then(() => {});
  });
}

export function deleteTransaction(id: string) {
  setItem(STORAGE_KEYS.transactions, getTransactions().filter((t) => t.id !== id));
  if (isSupabaseConfigured()) {
    supabase.from("transactions").delete().eq("id", id).then(() => {});
  }
}

// ─── Settings ───────────────────────────────────────────────────────────

export function getTaxRate(): number {
  return getItem(STORAGE_KEYS.taxRate, 15);
}

export function setTaxRate(rate: number) {
  setItem(STORAGE_KEYS.taxRate, rate);
}

export function getMonthlyExpenses(): number {
  return getItem(STORAGE_KEYS.monthlyExpenses, 30000);
}

export function setMonthlyExpenses(amount: number) {
  setItem(STORAGE_KEYS.monthlyExpenses, amount);
}

// ─── Currency ───────────────────────────────────────────────────────────

export function getDefaultCurrency(): string {
  return getItem(STORAGE_KEYS.currency, "THB");
}

export function setDefaultCurrency(currency: string) {
  setItem(STORAGE_KEYS.currency, currency);
}

// ─── Recurring Transactions ─────────────────────────────────────────────

export function getRecurringTransactions(): RecurringTransaction[] {
  return getItem(STORAGE_KEYS.recurring, []);
}

export function saveRecurringTransaction(rt: RecurringTransaction) {
  const list = getRecurringTransactions();
  const idx = list.findIndex((r) => r.id === rt.id);
  if (idx >= 0) list[idx] = rt;
  else list.push(rt);
  setItem(STORAGE_KEYS.recurring, list);
}

export function deleteRecurringTransaction(id: string) {
  setItem(STORAGE_KEYS.recurring, getRecurringTransactions().filter((r) => r.id !== id));
}

export function processRecurringTransactions() {
  const recurring = getRecurringTransactions();
  const today = new Date().toISOString().split("T")[0];
  let generated = 0;

  recurring.forEach((rt) => {
    if (!rt.active) return;
    if (rt.endDate && rt.endDate < today) return;

    // Calculate next due date from lastGenerated or startDate
    let nextDue = rt.lastGenerated || rt.startDate;

    while (nextDue <= today) {
      // Check if this transaction already exists
      const existingTx = getTransactions().find(
        (t) => t.id === `rec-${rt.id}-${nextDue}`
      );

      if (!existingTx && nextDue >= rt.startDate) {
        saveTransaction({
          id: `rec-${rt.id}-${nextDue}`,
          projectId: rt.projectId,
          clientId: rt.clientId,
          type: rt.type,
          amount: rt.amount,
          date: nextDue,
          description: `${rt.description} (อัตโนมัติ)`,
          category: rt.category,
          currency: rt.currency || "THB",
        });
        generated++;
      }

      // Advance to next period
      const d = new Date(nextDue);
      if (rt.frequency === "daily") d.setDate(d.getDate() + 1);
      else if (rt.frequency === "weekly") d.setDate(d.getDate() + 7);
      else if (rt.frequency === "monthly") d.setMonth(d.getMonth() + 1);
      else if (rt.frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
      nextDue = d.toISOString().split("T")[0];
    }

    // Update lastGenerated
    rt.lastGenerated = today;
    saveRecurringTransaction(rt);
  });

  return generated;
}

// ─── Cloud Sync ─────────────────────────────────────────────────────────

export async function syncFromCloud(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const userId = await getSupabaseUserId();
  if (!userId) return false;

  try {
    const [clientsRes, projectsRes, txRes] = await Promise.all([
      supabase.from("clients").select("*").eq("user_id", userId),
      supabase.from("projects").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
    ]);

    if (clientsRes.data) {
      const clients: Client[] = clientsRes.data.map((c) => ({
        id: c.id, name: c.name, email: c.email || "",
        color: c.color || "#6366f1", createdAt: c.created_at,
      }));
      setItem(STORAGE_KEYS.clients, clients);
    }

    if (projectsRes.data) {
      const projects: Project[] = projectsRes.data.map((p) => ({
        id: p.id, clientId: p.client_id, name: p.name,
        status: p.status, hourlyRate: Number(p.hourly_rate) || 0,
        createdAt: p.created_at,
      }));
      setItem(STORAGE_KEYS.projects, projects);
    }

    if (txRes.data) {
      const transactions: Transaction[] = txRes.data.map((t) => ({
        id: t.id, projectId: t.project_id, clientId: t.client_id,
        type: t.type, amount: Number(t.amount), date: t.date,
        description: t.description || "", category: t.category || "",
        currency: t.currency || "THB",
      }));
      setItem(STORAGE_KEYS.transactions, transactions);
    }

    return true;
  } catch {
    return false;
  }
}

export function isCloudEnabled(): boolean {
  return isSupabaseConfigured();
}

// ─── Backup / Restore ───────────────────────────────────────────────────

export function exportAllData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    clients: getClients(),
    projects: getProjects(),
    transactions: getTransactions(),
    recurring: getRecurringTransactions(),
    settings: {
      taxRate: getTaxRate(),
      monthlyExpenses: getMonthlyExpenses(),
      defaultCurrency: getDefaultCurrency(),
      userPlan: getUserPlan(),
    },
    invoices: getItem("ff_invoices", []),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version) return { success: false, error: "ไฟล์ไม่ถูกต้อง" };

    if (data.clients) setItem(STORAGE_KEYS.clients, data.clients);
    if (data.projects) setItem(STORAGE_KEYS.projects, data.projects);
    if (data.transactions) setItem(STORAGE_KEYS.transactions, data.transactions);
    if (data.recurring) setItem(STORAGE_KEYS.recurring, data.recurring);
    if (data.invoices) setItem("ff_invoices", data.invoices);
    if (data.settings) {
      if (data.settings.taxRate != null) setItem(STORAGE_KEYS.taxRate, data.settings.taxRate);
      if (data.settings.monthlyExpenses != null) setItem(STORAGE_KEYS.monthlyExpenses, data.settings.monthlyExpenses);
      if (data.settings.defaultCurrency) setItem(STORAGE_KEYS.currency, data.settings.defaultCurrency);
      if (data.settings.userPlan) setItem(STORAGE_KEYS.userPlan, data.settings.userPlan);
    }

    return { success: true };
  } catch {
    return { success: false, error: "ไฟล์ JSON ไม่ถูกต้อง" };
  }
}

// ─── Seed Demo Data ─────────────────────────────────────────────────────

export function seedDemoData() {
  const existingTx = getTransactions().filter((t) => !t.id.startsWith("demo-"));
  const existingClients = getClients().filter((c) => !c.id.startsWith("demo-"));
  const existingProjects = getProjects().filter((p) => !p.id.startsWith("demo-"));

  const demoClients: Client[] = [
    { id: "demo-client-1", name: "บริษัท ABC จำกัด", email: "contact@abc.co.th", color: "#6366f1", createdAt: "2026-01-01" },
    { id: "demo-client-2", name: "คุณสมชาย ธุรกิจดี", email: "somchai@email.com", color: "#10b981", createdAt: "2026-01-05" },
    { id: "demo-client-3", name: "StartupXYZ", email: "hello@startupxyz.com", color: "#f59e0b", createdAt: "2026-01-10" },
  ];

  const demoProjects: Project[] = [
    { id: "demo-proj-1", clientId: "demo-client-1", name: "เว็บไซต์ E-commerce", status: "active", hourlyRate: 1500, createdAt: "2026-01-02" },
    { id: "demo-proj-2", clientId: "demo-client-2", name: "ระบบจัดการร้านค้า", status: "active", hourlyRate: 1200, createdAt: "2026-01-06" },
    { id: "demo-proj-3", clientId: "demo-client-3", name: "แอป Mobile MVP", status: "active", hourlyRate: 1800, createdAt: "2026-01-11" },
  ];

  const monthlyData = [
    { month: "01", year: "2026", income: 1450245.60, expense: 114024.31 },
    { month: "02", year: "2026", income: 1562335.37, expense: 128000.00 },
    { month: "03", year: "2026", income: 792779.81, expense: 95000.19 },
  ];

  const incomeCategories = ["ค่าบริการ", "ค่าที่ปรึกษา", "งานออกแบบ", "พัฒนาเว็บ", "งานโปรเจกต์"];
  const expenseCategories = ["ค่าเช่าสำนักงาน", "ค่าอุปกรณ์", "ค่าซอฟต์แวร์", "ค่าเดินทาง", "ค่าสาธารณูปโภค", "อื่นๆ"];

  const transactions: Transaction[] = [];

  monthlyData.forEach(({ month, year, income, expense }) => {
    const incomeSplits = [0.45, 0.35, 0.20];
    incomeSplits.forEach((ratio, i) => {
      const day = String(5 + i * 10).padStart(2, "0");
      transactions.push({
        id: `demo-inc-${year}${month}-${i}`,
        projectId: demoProjects[i % demoProjects.length].id,
        clientId: demoClients[i % demoClients.length].id,
        type: "income",
        amount: Math.round(income * ratio * 100) / 100,
        date: `${year}-${month}-${day}`,
        description: `${incomeCategories[i % incomeCategories.length]} — ${demoClients[i % demoClients.length].name}`,
        category: incomeCategories[i % incomeCategories.length],
        currency: "THB",
      });
    });

    const expenseSplits = [0.6, 0.4];
    expenseSplits.forEach((ratio, i) => {
      const day = String(8 + i * 12).padStart(2, "0");
      transactions.push({
        id: `demo-exp-${year}${month}-${i}`,
        projectId: null,
        clientId: null,
        type: "expense",
        amount: Math.round(expense * ratio * 100) / 100,
        date: `${year}-${month}-${day}`,
        description: `${expenseCategories[i % expenseCategories.length]} — ${month}/${year}`,
        category: expenseCategories[i % expenseCategories.length],
        currency: "THB",
      });
    });
  });

  setItem(STORAGE_KEYS.clients, [...existingClients, ...demoClients]);
  setItem(STORAGE_KEYS.projects, [...existingProjects, ...demoProjects]);
  setItem(STORAGE_KEYS.transactions, [...existingTx, ...transactions]);
  return true;
}

export function clearDemoData() {
  setItem(STORAGE_KEYS.transactions, getTransactions().filter((t) => !t.id.startsWith("demo-")));
  setItem(STORAGE_KEYS.clients, getClients().filter((c) => !c.id.startsWith("demo-")));
  setItem(STORAGE_KEYS.projects, getProjects().filter((p) => !p.id.startsWith("demo-")));
}

// ─── Categories ──────────────────────────────────────────────────────────

export function getCategories(): string[] {
  return getItem<string[]>(STORAGE_KEYS.categories, []);
}

export function saveCategory(name: string) {
  const cats = getCategories();
  if (!cats.includes(name)) {
    cats.push(name);
    setItem(STORAGE_KEYS.categories, cats);
  }
}

export function deleteCategory(name: string) {
  setItem(STORAGE_KEYS.categories, getCategories().filter((c) => c !== name));
}

export function renameCategory(oldName: string, newName: string) {
  const cats = getCategories().map((c) => (c === oldName ? newName : c));
  setItem(STORAGE_KEYS.categories, cats);
  // Also update existing transactions that use this category
  const txs = getTransactions();
  let changed = false;
  txs.forEach((tx) => {
    if (tx.category === oldName) {
      tx.category = newName;
      changed = true;
    }
  });
  if (changed) setItem(STORAGE_KEYS.transactions, txs);
}

// ─── Income Goals ────────────────────────────────────────────────────────

export function getIncomeGoal(): IncomeGoal {
  return getItem<IncomeGoal>(STORAGE_KEYS.incomeGoal, {
    monthlyTarget: 0,
    yearlyTarget: 0,
  });
}

export function setIncomeGoal(goal: IncomeGoal) {
  setItem(STORAGE_KEYS.incomeGoal, goal);
}

// ─── Invoices ────────────────────────────────────────────────────────────

export function getInvoices(): Invoice[] {
  return getItem<Invoice[]>(STORAGE_KEYS.invoices, []);
}

export function getOverdueInvoiceCount(): number {
  const invoices = getInvoices();
  const today = new Date().toISOString().split("T")[0];
  return invoices.filter(
    (inv) => (inv.status === "overdue" || (inv.status === "sent" && inv.dueDate < today))
  ).length;
}

// ─── Plan ───────────────────────────────────────────────────────────────

export function getUserPlan(): UserPlan {
  return getItem<UserPlan>(STORAGE_KEYS.userPlan, {
    plan: "free",
    activatedAt: new Date().toISOString(),
    expiresAt: null,
  });
}

export function setUserPlan(plan: PlanType) {
  const now = new Date();
  const expiresAt = plan === "pro"
    ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
    : plan === "pro_yearly"
    ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString()
    : null;
  setItem<UserPlan>(STORAGE_KEYS.userPlan, {
    plan,
    activatedAt: now.toISOString(),
    expiresAt,
  });
}
