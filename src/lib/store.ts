import { Client, Project, Transaction, UserPlan, PlanType, IncomeGoal, Invoice } from "./types";
import type { RecurringTransaction } from "./types";
import { supabase } from "./supabase";
import { logActivity } from "./activity-logger";

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
  promptpayId: "ff_promptpay_id",
  lineNotifyToken: "ff_line_notify_token",
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
  const isNew = idx < 0;
  if (idx >= 0) clients[idx] = client;
  else clients.push(client);
  setItem(STORAGE_KEYS.clients, clients);
  if (isNew) logActivity("client_create", client.name, { clientId: client.id });

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
  const client = getClients().find((c) => c.id === id);
  setItem(STORAGE_KEYS.clients, getClients().filter((c) => c.id !== id));
  if (client) logActivity("client_delete", client.name, { clientId: id });
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
  const isNew = idx < 0;
  if (idx >= 0) transactions[idx] = tx;
  else transactions.push(tx);
  setItem(STORAGE_KEYS.transactions, transactions);
  if (isNew && !tx.id.startsWith("rec-")) logActivity("transaction_create", tx.description, { type: tx.type, amount: tx.amount });

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
  const tx = getTransactions().find((t) => t.id === id);
  setItem(STORAGE_KEYS.transactions, getTransactions().filter((t) => t.id !== id));
  if (tx) logActivity("transaction_delete", tx.description, { type: tx.type, amount: tx.amount });
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
  const isNew = idx < 0;
  if (idx >= 0) list[idx] = rt;
  else list.push(rt);
  setItem(STORAGE_KEYS.recurring, list);
  if (isNew) logActivity("recurring_create", rt.description, { type: rt.type, amount: rt.amount });

  getSupabaseUserId().then((userId) => {
    if (!userId) return;
    supabase.from("recurring_transactions").upsert({
      id: rt.id, user_id: userId, type: rt.type, amount: rt.amount,
      description: rt.description, category: rt.category,
      client_id: rt.clientId, project_id: rt.projectId,
      frequency: rt.frequency, start_date: rt.startDate,
      end_date: rt.endDate, active: rt.active,
      last_generated: rt.lastGenerated, currency: rt.currency || "THB",
    }).then(() => {});
  });
}

export function deleteRecurringTransaction(id: string) {
  const rt = getRecurringTransactions().find((r) => r.id === id);
  setItem(STORAGE_KEYS.recurring, getRecurringTransactions().filter((r) => r.id !== id));
  if (rt) logActivity("recurring_delete", rt.description, { type: rt.type, amount: rt.amount });
  if (isSupabaseConfigured()) {
    supabase.from("recurring_transactions").delete().eq("id", id).then(() => {});
  }
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

// ─── Auto-generate Invoices from Recurring Income ───────────────────────

export function generateInvoicesFromRecurring() {
  const recurring = getRecurringTransactions();
  const invoices: Invoice[] = getItem("ff_invoices", []);
  const today = new Date().toISOString().split("T")[0];
  let created = 0;

  recurring.forEach((rt) => {
    if (!rt.active || rt.type !== "income" || !rt.clientId) return;

    // Check if invoice already exists for this month + recurring item
    const monthKey = today.slice(0, 7); // YYYY-MM
    const invId = `auto-inv-${rt.id}-${monthKey}`;
    if (invoices.some((inv) => inv.id === invId)) return;

    // Only generate if there's a transaction for this period
    const txExists = getTransactions().some(
      (t) => t.id === `rec-${rt.id}-${today}` || (t.description?.includes(rt.description) && t.date.startsWith(monthKey))
    );
    if (!txExists) return;

    const y = today.slice(0, 4);
    const m = today.slice(5, 7);
    const seq = String(invoices.length + 1).padStart(4, "0");

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice: Invoice = {
      id: invId,
      invoiceNumber: `INV-${y}${m}-${seq}`,
      clientId: rt.clientId,
      projectId: rt.projectId,
      items: [{ description: rt.description, quantity: 1, unitPrice: rt.amount }],
      status: "sent",
      issueDate: today,
      dueDate: dueDate.toISOString().split("T")[0],
      notes: "สร้างอัตโนมัติจากรายการประจำ",
      createdAt: new Date().toISOString(),
    };

    invoices.push(invoice);
    created++;
  });

  if (created > 0) {
    setItem("ff_invoices", invoices);
  }
  return created;
}

// ─── Cloud Sync ─────────────────────────────────────────────────────────

export async function syncFromCloud(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const userId = await getSupabaseUserId();
  if (!userId) return false;

  try {
    const [clientsRes, projectsRes, txRes, recurringRes, invoicesRes, profileRes] = await Promise.all([
      supabase.from("clients").select("*").eq("user_id", userId),
      supabase.from("projects").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("recurring_transactions").select("*").eq("user_id", userId),
      supabase.from("invoices").select("*").eq("user_id", userId),
      supabase.from("user_profiles").select("*").eq("id", userId).single(),
    ]);

    if (clientsRes.data?.length) {
      const clients: Client[] = clientsRes.data.map((c) => ({
        id: c.id, name: c.name, email: c.email || "",
        color: c.color || "#6366f1", createdAt: c.created_at,
      }));
      setItem(STORAGE_KEYS.clients, clients);
    }

    if (projectsRes.data?.length) {
      const projects: Project[] = projectsRes.data.map((p) => ({
        id: p.id, clientId: p.client_id, name: p.name,
        status: p.status, hourlyRate: Number(p.hourly_rate) || 0,
        createdAt: p.created_at,
      }));
      setItem(STORAGE_KEYS.projects, projects);
    }

    if (txRes.data?.length) {
      const transactions: Transaction[] = txRes.data.map((t) => ({
        id: t.id, projectId: t.project_id, clientId: t.client_id,
        type: t.type, amount: Number(t.amount), date: t.date,
        description: t.description || "", category: t.category || "",
        currency: t.currency || "THB",
      }));
      setItem(STORAGE_KEYS.transactions, transactions);
    }

    if (recurringRes.data?.length) {
      const recurring: RecurringTransaction[] = recurringRes.data.map((r) => ({
        id: r.id, type: r.type, amount: Number(r.amount),
        description: r.description || "", category: r.category || "",
        clientId: r.client_id, projectId: r.project_id,
        frequency: r.frequency, startDate: r.start_date,
        endDate: r.end_date, active: r.active,
        lastGenerated: r.last_generated, currency: r.currency || "THB",
      }));
      setItem(STORAGE_KEYS.recurring, recurring);
    }

    if (invoicesRes.data?.length) {
      const invoices: Invoice[] = invoicesRes.data.map((i) => ({
        id: i.id, invoiceNumber: i.invoice_number,
        clientId: i.client_id, projectId: i.project_id,
        items: i.items || [], status: i.status,
        issueDate: i.issue_date, dueDate: i.due_date,
        notes: i.notes || "", createdAt: i.created_at,
      }));
      setItem(STORAGE_KEYS.invoices, invoices);
    }

    if (profileRes.data) {
      const p = profileRes.data;
      if (p.plan) setItem(STORAGE_KEYS.userPlan, { plan: p.plan, activatedAt: p.created_at, expiresAt: null });
      if (p.currency) setItem(STORAGE_KEYS.currency, p.currency);
      if (p.tax_rate != null) setItem(STORAGE_KEYS.taxRate, Number(p.tax_rate));
      if (p.monthly_expenses != null) setItem(STORAGE_KEYS.monthlyExpenses, Number(p.monthly_expenses));
      if (p.promptpay_id) setItem(STORAGE_KEYS.promptpayId, p.promptpay_id);
      if (p.income_goal && Object.keys(p.income_goal).length) setItem(STORAGE_KEYS.incomeGoal, p.income_goal);
    }

    return true;
  } catch {
    return false;
  }
}

export function isCloudEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function syncToCloud(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase not configured" };

  const userId = await getSupabaseUserId();
  if (!userId) return { success: false, error: "Not logged in" };

  try {
    const clients = getClients();
    const projects = getProjects();
    const transactions = getTransactions();
    const recurring = getRecurringTransactions();
    const invoices: Invoice[] = getItem("ff_invoices", []);

    // Upsert clients
    if (clients.length > 0) {
      const { error } = await supabase.from("clients").upsert(
        clients.map((c) => ({
          id: c.id, user_id: userId, name: c.name,
          email: c.email, color: c.color, created_at: c.createdAt,
        })),
        { onConflict: "id" }
      );
      if (error) throw error;
    }

    // Upsert projects
    if (projects.length > 0) {
      const { error } = await supabase.from("projects").upsert(
        projects.map((p) => ({
          id: p.id, user_id: userId, client_id: p.clientId, name: p.name,
          status: p.status, hourly_rate: p.hourlyRate, created_at: p.createdAt,
        })),
        { onConflict: "id" }
      );
      if (error) throw error;
    }

    // Upsert transactions
    if (transactions.length > 0) {
      const { error } = await supabase.from("transactions").upsert(
        transactions.map((t) => ({
          id: t.id, user_id: userId, project_id: t.projectId, client_id: t.clientId,
          type: t.type, amount: t.amount, date: t.date,
          description: t.description, category: t.category, currency: t.currency || "THB",
        })),
        { onConflict: "id" }
      );
      if (error) throw error;
    }

    // Upsert recurring
    if (recurring.length > 0) {
      const { error } = await supabase.from("recurring_transactions").upsert(
        recurring.map((r) => ({
          id: r.id, user_id: userId, type: r.type, amount: r.amount,
          description: r.description, category: r.category,
          client_id: r.clientId, project_id: r.projectId,
          frequency: r.frequency, start_date: r.startDate,
          end_date: r.endDate, active: r.active,
          last_generated: r.lastGenerated, currency: r.currency || "THB",
        })),
        { onConflict: "id" }
      );
      if (error) throw error;
    }

    // Upsert invoices
    if (invoices.length > 0) {
      const { error } = await supabase.from("invoices").upsert(
        invoices.map((i) => ({
          id: i.id, user_id: userId, invoice_number: i.invoiceNumber,
          client_id: i.clientId, project_id: i.projectId,
          items: i.items, status: i.status,
          issue_date: i.issueDate, due_date: i.dueDate,
          notes: i.notes, created_at: i.createdAt,
        })),
        { onConflict: "id" }
      );
      if (error) throw error;
    }

    // Upsert user profile/settings
    const { error: profileError } = await supabase.from("user_profiles").upsert({
      id: userId,
      plan: getUserPlan().plan,
      currency: getDefaultCurrency(),
      tax_rate: getTaxRate(),
      monthly_expenses: getMonthlyExpenses(),
      promptpay_id: getPromptPayId(),
      income_goal: getIncomeGoal(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (profileError) throw profileError;

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
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

  // Demo Invoices
  const demoInvoices = [
    {
      id: "demo-inv-1",
      invoiceNumber: "INV-202601-0001",
      clientId: "demo-client-1",
      projectId: "demo-proj-1",
      items: [
        { description: "พัฒนาเว็บไซต์ E-commerce", quantity: 1, unitPrice: 150000 },
        { description: "ออกแบบ UI/UX", quantity: 1, unitPrice: 35000 },
      ],
      status: "paid" as const,
      issueDate: "2026-01-15",
      dueDate: "2026-02-15",
      notes: "ชำระแล้วผ่านโอนบัญชี",
      createdAt: "2026-01-15T00:00:00.000Z",
    },
    {
      id: "demo-inv-2",
      invoiceNumber: "INV-202602-0002",
      clientId: "demo-client-2",
      projectId: "demo-proj-2",
      items: [
        { description: "ระบบจัดการสินค้าคงคลัง", quantity: 1, unitPrice: 85000 },
        { description: "ฝึกอบรมทีมงาน", quantity: 2, unitPrice: 5000 },
      ],
      status: "sent" as const,
      issueDate: "2026-02-20",
      dueDate: "2026-03-20",
      notes: "",
      createdAt: "2026-02-20T00:00:00.000Z",
    },
    {
      id: "demo-inv-3",
      invoiceNumber: "INV-202603-0003",
      clientId: "demo-client-3",
      projectId: "demo-proj-3",
      items: [
        { description: "แอป Mobile MVP - Phase 1", quantity: 1, unitPrice: 200000 },
      ],
      status: "overdue" as const,
      issueDate: "2026-02-01",
      dueDate: "2026-03-01",
      notes: "กรุณาชำระภายใน 7 วัน",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ];

  // Demo Recurring
  const demoRecurring: RecurringTransaction[] = [
    {
      id: "demo-rec-1",
      type: "expense",
      amount: 15000,
      description: "ค่าเช่า Co-working Space",
      category: "ค่าเช่าสำนักงาน",
      frequency: "monthly",
      startDate: "2026-01-01",
      endDate: null,
      active: true,
      lastGenerated: "2026-03-01",
      projectId: null,
      clientId: null,
      currency: "THB",
    },
    {
      id: "demo-rec-2",
      type: "expense",
      amount: 990,
      description: "ค่า Figma Pro",
      category: "ค่าซอฟต์แวร์",
      frequency: "monthly",
      startDate: "2026-01-01",
      endDate: null,
      active: true,
      lastGenerated: "2026-03-01",
      projectId: null,
      clientId: null,
      currency: "THB",
    },
  ];

  const existingInvoices = getItem<typeof demoInvoices>("ff_invoices", []).filter((i) => !i.id.startsWith("demo-"));
  const existingRecurring = getRecurringTransactions().filter((r) => !r.id.startsWith("demo-"));

  setItem(STORAGE_KEYS.clients, [...existingClients, ...demoClients]);
  setItem(STORAGE_KEYS.projects, [...existingProjects, ...demoProjects]);
  setItem(STORAGE_KEYS.transactions, [...existingTx, ...transactions]);
  setItem("ff_invoices", [...existingInvoices, ...demoInvoices]);
  setItem(STORAGE_KEYS.recurring, [...existingRecurring, ...demoRecurring]);
  return true;
}

export function clearDemoData() {
  setItem(STORAGE_KEYS.transactions, getTransactions().filter((t) => !t.id.startsWith("demo-")));
  setItem(STORAGE_KEYS.clients, getClients().filter((c) => !c.id.startsWith("demo-")));
  setItem(STORAGE_KEYS.projects, getProjects().filter((p) => !p.id.startsWith("demo-")));
  setItem("ff_invoices", getItem<{ id: string }[]>("ff_invoices", []).filter((i) => !i.id.startsWith("demo-")));
  setItem(STORAGE_KEYS.recurring, getRecurringTransactions().filter((r) => !r.id.startsWith("demo-")));
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

// ─── PromptPay ───────────────────────────────────────────────────────────

export function getPromptPayId(): string {
  return getItem<string>(STORAGE_KEYS.promptpayId, "");
}

export function setPromptPayId(id: string) {
  setItem(STORAGE_KEYS.promptpayId, id);
}

// ─── Line Notify ─────────────────────────────────────────────────────────

export function getLineNotifyToken(): string {
  return getItem<string>(STORAGE_KEYS.lineNotifyToken, "");
}

export function setLineNotifyToken(token: string) {
  setItem(STORAGE_KEYS.lineNotifyToken, token);
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

export function saveInvoice(invoice: Invoice) {
  const invoices = getInvoices();
  const idx = invoices.findIndex((i) => i.id === invoice.id);
  const isNew = idx < 0;
  if (idx >= 0) invoices[idx] = invoice;
  else invoices.push(invoice);
  setItem(STORAGE_KEYS.invoices, invoices);
  if (isNew) logActivity("invoice_create", invoice.invoiceNumber, { clientId: invoice.clientId });
  else logActivity("invoice_update", invoice.invoiceNumber, { status: invoice.status });

  getSupabaseUserId().then((userId) => {
    if (!userId) return;
    supabase.from("invoices").upsert({
      id: invoice.id, user_id: userId,
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId, project_id: invoice.projectId,
      items: invoice.items, status: invoice.status,
      issue_date: invoice.issueDate, due_date: invoice.dueDate,
      notes: invoice.notes,
    }).then(() => {});
  });
}

export function deleteInvoice(id: string) {
  setItem(STORAGE_KEYS.invoices, getInvoices().filter((i) => i.id !== id));
  if (isSupabaseConfigured()) {
    supabase.from("invoices").delete().eq("id", id).then(() => {});
  }
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
  logActivity("plan_change", `Changed to ${plan}`, { plan });

  getSupabaseUserId().then((userId) => {
    if (!userId) return;
    supabase.from("user_profiles").update({ plan, updated_at: new Date().toISOString() }).eq("id", userId).then(() => {});
  });
}

export function startTrialPlan() {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  setItem<UserPlan>(STORAGE_KEYS.userPlan, {
    plan: "pro",
    activatedAt: now.toISOString(),
    expiresAt,
  });
  localStorage.setItem("ff_trial_used", "true");
}

export function hasUsedTrial(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("ff_trial_used") === "true";
}
