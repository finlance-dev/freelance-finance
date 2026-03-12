"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getClients,
  saveClient,
  deleteClient,
  getProjects,
  saveProject,
  deleteProject,
  getTransactions,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Client, Project, Transaction } from "@/lib/types";
import { EmptyClientsIllustration } from "@/components/illustrations";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeBanner } from "@/components/upgrade-prompt";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";
import { useLocale } from "@/hooks/useLocale";

const CLIENT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
];

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary" />
        <div>
          <div className="h-4 w-32 bg-secondary rounded mb-1.5" />
          <div className="h-3 w-24 bg-secondary rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);

  // Client form
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({ name: "", email: "", color: CLIENT_COLORS[0] });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    clientId: "",
    hourlyRate: 0,
    status: "active" as "active" | "completed" | "paused",
  });
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});

  // Expanded clients
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Plan
  const { canAddClient, clientsRemaining, isPro } = usePlan();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { locale, t } = useLocale();

  useEffect(() => {
    reload();
    setMounted(true);
  }, []);

  const reload = () => {
    setClients(getClients());
    setProjects(getProjects());
    setTransactions(getTransactions());
  };

  const getClientRevenue = (clientId: string) =>
    transactions
      .filter((t) => t.clientId === clientId && t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

  const getProjectRevenue = (projectId: string) =>
    transactions
      .filter((t) => t.projectId === projectId && t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

  const getProjectExpenses = (projectId: string) =>
    transactions
      .filter((t) => t.projectId === projectId && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

  // Client CRUD
  const validateClient = (): boolean => {
    const errs: Record<string, string> = {};
    if (!clientForm.name.trim()) errs.name = t("clients", "errName");
    if (clientForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.email)) errs.email = t("clients", "errEmail");
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveClient = () => {
    if (!validateClient()) return;
    const client: Client = {
      id: editingClientId || crypto.randomUUID(),
      name: clientForm.name.trim(),
      email: clientForm.email.trim(),
      color: clientForm.color,
      createdAt: new Date().toISOString(),
    };
    saveClient(client);
    reload();
    setShowClientForm(false);
    setEditingClientId(null);
    setClientForm({ name: "", email: "", color: CLIENT_COLORS[0] });
    setClientErrors({});
    toast(editingClientId ? t("clients", "clientEdited") : t("clients", "clientAdded"));
  };

  const handleEditClient = (c: Client) => {
    setClientForm({ name: c.name, email: c.email, color: c.color });
    setEditingClientId(c.id);
    setClientErrors({});
    setShowClientForm(true);
  };

  const handleDeleteClient = async (id: string) => {
    const ok = await confirm({
      title: t("clients", "deleteClient"),
      message: t("clients", "deleteClientConfirm"),
      confirmText: t("common", "delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteClient(id);
    reload();
    toast(t("clients", "clientDeleted"));
  };

  // Project CRUD
  const validateProject = (): boolean => {
    const errs: Record<string, string> = {};
    if (!projectForm.name.trim()) errs.name = t("clients", "errProjectName");
    if (!projectForm.clientId) errs.clientId = t("clients", "errSelectClient");
    setProjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProject = () => {
    if (!validateProject()) return;
    const project: Project = {
      id: editingProjectId || crypto.randomUUID(),
      clientId: projectForm.clientId,
      name: projectForm.name.trim(),
      status: projectForm.status,
      hourlyRate: Number(projectForm.hourlyRate),
      createdAt: new Date().toISOString(),
    };
    saveProject(project);
    reload();
    setShowProjectForm(false);
    setEditingProjectId(null);
    setProjectForm({ name: "", clientId: "", hourlyRate: 0, status: "active" });
    setProjectErrors({});
    toast(editingProjectId ? t("clients", "projectEdited") : t("clients", "projectAdded"));
  };

  const handleEditProject = (p: Project) => {
    setProjectForm({
      name: p.name,
      clientId: p.clientId,
      hourlyRate: p.hourlyRate,
      status: p.status,
    });
    setEditingProjectId(p.id);
    setProjectErrors({});
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id: string) => {
    const ok = await confirm({
      title: t("clients", "deleteProject"),
      message: t("clients", "deleteProjectConfirm"),
      confirmText: t("common", "delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteProject(id);
    reload();
    toast(t("clients", "projectDeleted"));
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedClients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedClients(next);
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-44 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-56 bg-secondary rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("clients", "title")}</h1>
          <p className="text-muted text-sm mt-1">{t("clients", "subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowProjectForm(true);
              setEditingProjectId(null);
              setProjectForm({ name: "", clientId: clients[0]?.id || "", hourlyRate: 0, status: "active" });
              setProjectErrors({});
            }}
            className="bg-secondary hover:bg-border text-foreground px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 text-sm"
          >
            <FolderOpen className="w-4 h-4" />
            {t("clients", "addProject")}
          </button>
          <button
            onClick={() => {
              if (!canAddClient()) {
                toast(t("clients", "freeLimitWarning"), "warning");
                return;
              }
              setShowClientForm(true);
              setEditingClientId(null);
              setClientForm({ name: "", email: "", color: CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)] });
              setClientErrors({});
            }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("clients", "addClient")}
          </button>
        </div>
      </div>

      {!isPro && <UpgradeBanner clientsRemaining={clientsRemaining()} />}

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingClientId ? t("clients", "editClient") : t("clients", "addClient")}
              </h2>
              <button onClick={() => { setShowClientForm(false); setClientErrors({}); }} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "clientName")}</label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => { setClientForm({ ...clientForm, name: e.target.value }); setClientErrors({ ...clientErrors, name: "" }); }}
                  placeholder={t("clients", "clientNamePlaceholder")}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${clientErrors.name ? "border-danger" : "border-border"}`}
                />
                {clientErrors.name && <p className="text-danger text-xs mt-1">{clientErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "email")}</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => { setClientForm({ ...clientForm, email: e.target.value }); setClientErrors({ ...clientErrors, email: "" }); }}
                  placeholder={t("clients", "emailPlaceholder")}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${clientErrors.email ? "border-danger" : "border-border"}`}
                />
                {clientErrors.email && <p className="text-danger text-xs mt-1">{clientErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "color")}</label>
                <div className="flex gap-2 flex-wrap">
                  {CLIENT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setClientForm({ ...clientForm, color })}
                      className={`w-8 h-8 rounded-full transition ${
                        clientForm.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveClient}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                {editingClientId ? t("clients", "saveChanges") : t("clients", "addClient")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingProjectId ? t("clients", "editProject") : t("clients", "addProject")}
              </h2>
              <button onClick={() => { setShowProjectForm(false); setProjectErrors({}); }} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "projectName")}</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => { setProjectForm({ ...projectForm, name: e.target.value }); setProjectErrors({ ...projectErrors, name: "" }); }}
                  placeholder={t("clients", "projectNamePlaceholder")}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${projectErrors.name ? "border-danger" : "border-border"}`}
                />
                {projectErrors.name && <p className="text-danger text-xs mt-1">{projectErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "selectClient")}</label>
                <select
                  value={projectForm.clientId}
                  onChange={(e) => { setProjectForm({ ...projectForm, clientId: e.target.value }); setProjectErrors({ ...projectErrors, clientId: "" }); }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${projectErrors.clientId ? "border-danger" : "border-border"}`}
                >
                  <option value="">{t("clients", "selectClient")}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {projectErrors.clientId && <p className="text-danger text-xs mt-1">{projectErrors.clientId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "hourlyRate")}</label>
                <input
                  type="number"
                  value={projectForm.hourlyRate || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, hourlyRate: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("clients", "status")}</label>
                <select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project["status"] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">{t("clients", "active")}</option>
                  <option value="paused">{t("clients", "paused")}</option>
                  <option value="completed">{t("clients", "completed")}</option>
                </select>
              </div>
              <button
                onClick={handleSaveProject}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                {editingProjectId ? t("clients", "saveChanges") : t("clients", "addProject")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <EmptyClientsIllustration className="w-44 h-auto mx-auto mb-4" />
          <p className="text-lg font-medium mb-1">{t("clients", "noClients")}</p>
          <p className="text-sm text-muted">{t("clients", "addFirstClient")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);
            const revenue = getClientRevenue(client.id);
            const isExpanded = expandedClients.has(client.id);

            return (
              <div key={client.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-card-hover transition"
                  onClick={() => toggleExpand(client.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted" />
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-xs text-muted">
                        {clientProjects.length} {t("clients", "projects")} · {client.email || t("clients", "noEmail")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-accent">{formatCurrency(revenue)}</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1.5 text-muted hover:text-danger hover:bg-secondary rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && clientProjects.length > 0 && (
                  <div className="border-t border-border divide-y divide-border">
                    {clientProjects.map((project) => {
                      const rev = getProjectRevenue(project.id);
                      const exp = getProjectExpenses(project.id);
                      const profit = rev - exp;
                      return (
                        <div key={project.id} className="flex items-center justify-between px-4 py-3 pl-16">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-4 h-4 text-muted" />
                            <div>
                              <p className="font-medium text-sm">{project.name}</p>
                              <p className="text-xs text-muted">
                                {project.hourlyRate > 0 && `${formatCurrency(project.hourlyRate)}/hr · `}
                                <span
                                  className={
                                    project.status === "active"
                                      ? "text-accent"
                                      : project.status === "completed"
                                      ? "text-primary"
                                      : "text-warning"
                                  }
                                >
                                  {project.status === "active" ? t("clients", "active") : project.status === "completed" ? t("clients", "completed") : t("clients", "paused")}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(rev)}</p>
                              {isPro ? (
                                <p className={`text-xs ${profit >= 0 ? "text-accent" : "text-danger"}`}>
                                  {t("clients", "profit")} {formatCurrency(profit)}
                                </p>
                              ) : (
                                <p className="text-xs text-muted">{t("clients", "upgradeToSeeProfit")}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditProject(project)}
                                className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-1.5 text-muted hover:text-danger hover:bg-secondary rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isExpanded && clientProjects.length === 0 && (
                  <div className="border-t border-border p-4 pl-16 text-sm text-muted">
                    {t("clients", "noProjectsForClient")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
