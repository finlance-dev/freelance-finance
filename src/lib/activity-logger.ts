import { ActivityEvent, ActivityEventType } from "./types";

const STORAGE_KEY = "ff_activity_log";
const MAX_EVENTS = 500;

function getCurrentUser(): { email: string; name: string } {
  if (typeof window === "undefined") return { email: "", name: "" };
  try {
    const user = JSON.parse(localStorage.getItem("ff_user") || "{}");
    return { email: user.email || "", name: user.name || "" };
  } catch {
    return { email: "", name: "" };
  }
}

export function logActivity(type: ActivityEventType, detail: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const user = getCurrentUser();
  const event: ActivityEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    userId: user.email,
    userEmail: user.email,
    userName: user.name,
    detail,
    metadata,
    createdAt: new Date().toISOString(),
  };

  try {
    const events: ActivityEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    events.unshift(event);
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // silently fail
  }
}

export function getActivityLog(): ActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
