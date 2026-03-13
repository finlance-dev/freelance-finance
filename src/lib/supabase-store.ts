import { supabase } from "./supabase";
import type { Client, Project, Transaction } from "./types";

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url !== "" && url !== "your_supabase_url_here";
};

// ─── Auth ────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  if (!isSupabaseConfigured()) {
    // Demo mode: store in localStorage
    localStorage.setItem("ff_user", JSON.stringify({ email, name }));
    // Reset onboarding for new signups
    localStorage.removeItem("ff_onboarding_done");
    return { user: { email, name }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (!error && data.user) {
    localStorage.setItem("ff_user", JSON.stringify({ email, name, id: data.user.id }));
  }
  return { user: data.user, error };
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    const name = email.split("@")[0];
    const isNewUser = !localStorage.getItem("ff_user");
    localStorage.setItem("ff_user", JSON.stringify({ email, name }));
    // Show onboarding for first-time users
    if (isNewUser) {
      localStorage.removeItem("ff_onboarding_done");
    }
    return { user: { email, name }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error && data.user) {
    const name = data.user.user_metadata?.name || email.split("@")[0];
    localStorage.setItem("ff_user", JSON.stringify({ email, name, id: data.user.id }));
  }
  return { user: data.user, error };
}

export async function signOut() {
  localStorage.removeItem("ff_user");
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem("ff_user");
    return stored ? JSON.parse(stored) : null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── Clients (Supabase) ─────────────────────────────────────────────────

export async function fetchClients(): Promise<Client[]> {
  if (!isSupabaseConfigured()) return [];

  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email || "",
    color: c.color || "#6366f1",
    createdAt: c.created_at,
  }));
}

export async function upsertClient(client: Client) {
  if (!isSupabaseConfigured()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("clients").upsert({
    id: client.id,
    user_id: user.id,
    name: client.name,
    email: client.email,
    color: client.color,
  });
}

export async function removeClient(id: string) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("clients").delete().eq("id", id);
}

// ─── Projects (Supabase) ────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];

  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (data || []).map((p) => ({
    id: p.id,
    clientId: p.client_id,
    name: p.name,
    status: p.status,
    hourlyRate: Number(p.hourly_rate) || 0,
    createdAt: p.created_at,
  }));
}

export async function upsertProject(project: Project) {
  if (!isSupabaseConfigured()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("projects").upsert({
    id: project.id,
    user_id: user.id,
    client_id: project.clientId,
    name: project.name,
    status: project.status,
    hourly_rate: project.hourlyRate,
  });
}

export async function removeProject(id: string) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("projects").delete().eq("id", id);
}

// ─── Transactions (Supabase) ────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) return [];

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  return (data || []).map((t) => ({
    id: t.id,
    projectId: t.project_id,
    clientId: t.client_id,
    type: t.type,
    amount: Number(t.amount),
    date: t.date,
    description: t.description || "",
    category: t.category || "",
  }));
}

export async function upsertTransaction(tx: Transaction) {
  if (!isSupabaseConfigured()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("transactions").upsert({
    id: tx.id,
    user_id: user.id,
    project_id: tx.projectId,
    client_id: tx.clientId,
    type: tx.type,
    amount: tx.amount,
    date: tx.date,
    description: tx.description,
    category: tx.category,
  });
}

export async function removeTransaction(id: string) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("transactions").delete().eq("id", id);
}

// ─── Google OAuth ────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) return { error: { message: "Supabase not configured" } };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

// ─── Sync Helper ────────────────────────────────────────────────────────

export function isCloudEnabled() {
  return isSupabaseConfigured();
}
