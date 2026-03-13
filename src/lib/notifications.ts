import type { AppNotification, NotificationType, NotificationPriority } from "./types";
import { getInvoices, getTransactions, getMonthlyExpenses, getIncomeGoal } from "./store";

const STORAGE_KEY = "ff_notifications";
const MAX_NOTIFICATIONS = 50;

// ─── CRUD ────────────────────────────────────────────────────────────────

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const items: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const now = new Date().toISOString();
    // Filter expired
    return items.filter((n) => !n.expiresAt || n.expiresAt > now);
  } catch {
    return [];
  }
}

export function addNotification(
  type: NotificationType,
  priority: NotificationPriority,
  titleKey: string,
  messageKey: string,
  opts?: { messageParams?: Record<string, string | number>; actionUrl?: string; expiresAt?: string }
): AppNotification {
  const notification: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    priority,
    titleKey,
    messageKey,
    messageParams: opts?.messageParams,
    actionUrl: opts?.actionUrl,
    read: false,
    createdAt: new Date().toISOString(),
    expiresAt: opts?.expiresAt,
  };

  const list = getNotifications();
  list.unshift(notification);
  if (list.length > MAX_NOTIFICATIONS) list.length = MAX_NOTIFICATIONS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return notification;
}

export function markAsRead(id: string) {
  const list = getNotifications();
  const item = list.find((n) => n.id === id);
  if (item) {
    item.read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function markAllAsRead() {
  const list = getNotifications();
  list.forEach((n) => (n.read = true));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function dismissNotification(id: string) {
  const list = getNotifications().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

// ─── Trigger Checks ──────────────────────────────────────────────────────
// Call once per session to generate notifications from current data state

export function checkAndGenerateNotifications() {
  const existing = getNotifications();
  const today = new Date().toISOString().split("T")[0];

  // Helper: check if a notification of this type was already created today
  const hasToday = (type: NotificationType) =>
    existing.some((n) => n.type === type && n.createdAt.startsWith(today));

  // 1. Overdue invoices
  if (!hasToday("invoice_overdue")) {
    const invoices = getInvoices();
    const overdue = invoices.filter(
      (inv) => inv.status === "overdue" || (inv.status === "sent" && inv.dueDate < today)
    );
    if (overdue.length > 0) {
      addNotification("invoice_overdue", "critical", "notifInvoiceOverdueTitle", "notifInvoiceOverdueMsg", {
        messageParams: { count: overdue.length },
        actionUrl: "/dashboard/invoices",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // 2. Low runway (< 3 months)
  if (!hasToday("low_runway")) {
    const transactions = getTransactions();
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const recentTx = transactions.filter((t) => new Date(t.date) >= sixMonthsAgo);
    const totalIncome = recentTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = recentTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const monthlyExpenses = getMonthlyExpenses();

    if (monthlyExpenses > 0 && netSavings > 0) {
      const runway = netSavings / monthlyExpenses;
      if (runway < 3) {
        addNotification("low_runway", "warning", "notifLowRunwayTitle", "notifLowRunwayMsg", {
          messageParams: { months: Math.round(runway * 10) / 10 },
          actionUrl: "/dashboard",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }

  // 3. Income goal reached
  if (!hasToday("income_goal_reached")) {
    const goal = getIncomeGoal();
    if (goal.monthlyTarget > 0) {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const transactions = getTransactions();
      const monthlyIncome = transactions
        .filter((t) => t.type === "income" && t.date >= monthStart)
        .reduce((s, t) => s + t.amount, 0);

      if (monthlyIncome >= goal.monthlyTarget) {
        addNotification("income_goal_reached", "info", "notifGoalReachedTitle", "notifGoalReachedMsg", {
          messageParams: { amount: Math.round(monthlyIncome).toLocaleString() },
          actionUrl: "/dashboard",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }

  // 4. Tax deadline (quarterly — remind near end of quarter)
  if (!hasToday("tax_deadline")) {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();
    // Thai tax quarters end: Mar(2), Jun(5), Sep(8), Dec(11)
    // Remind in last 15 days of quarter-end month
    const quarterEndMonths = [2, 5, 8, 11];
    if (quarterEndMonths.includes(month) && day >= 15) {
      const quarter = quarterEndMonths.indexOf(month) + 1;
      const daysLeft = new Date(now.getFullYear(), month + 1, 0).getDate() - day;
      addNotification("tax_deadline", "warning", "notifTaxDeadlineTitle", "notifTaxDeadlineMsg", {
        messageParams: { quarter, daysLeft },
        actionUrl: "/dashboard/tax",
        expiresAt: new Date(now.getFullYear(), month + 1, 1).toISOString(),
      });
    }
  }
}
