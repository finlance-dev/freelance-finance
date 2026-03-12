import { ActivityEvent, ActivityEventType } from "./types";
import { supabase } from "./supabase";

const STORAGE_KEY = "ff_activity_log";
const MAX_EVENTS = 500;

function getCurrentUser(): { id: string; email: string; name: string } {
  if (typeof window === "undefined") return { id: "", email: "", name: "" };
  try {
    const user = JSON.parse(localStorage.getItem("ff_user") || "{}");
    return { id: user.id || "", email: user.email || "", name: user.name || "" };
  } catch {
    return { id: "", email: "", name: "" };
  }
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url !== "" && url !== "your_supabase_url_here";
}

export function logActivity(type: ActivityEventType, detail: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const user = getCurrentUser();
  const event: ActivityEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    userId: user.id || user.email,
    userEmail: user.email,
    userName: user.name,
    detail,
    metadata,
    createdAt: new Date().toISOString(),
  };

  // Save to localStorage
  try {
    const events: ActivityEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    events.unshift(event);
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // silently fail
  }

  // Also save to Supabase (background, fire-and-forget)
  if (isSupabaseConfigured() && user.email) {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      supabase.from("activity_log").insert({
        user_id: uid,
        user_email: user.email,
        user_name: user.name,
        type,
        detail,
        metadata: metadata || {},
      }).then(() => {});
    });
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
