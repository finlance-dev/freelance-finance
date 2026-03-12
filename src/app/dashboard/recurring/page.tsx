"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Pause,
  Play,
} from "lucide-react";
import {
  getRecurringTransactions,
  saveRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions,
  getClients,
  getProjects,
  getDefaultCurrency,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { RecurringTransaction, Client, Project } from "@/lib/types";
import { SUPPORTED_CURRENCIES } from "@/lib/types";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useLocale } from "@/hooks/useLocale";

const EXPENSE_CATEGORIES = [
  "ค่าเช่าสำนักงาน", "ค่าอุปกรณ์", "ค่าซอฟต์แวร์",
  "ค่าเดินทาง", "ค่าสาธารณูปโภค", "ประกัน", "อื่นๆ",
];

const emptyForm = {
  type: "expense" as "income" | "expense",
  amount: 0,
  description: "",
  category: "",
  clientId: null as string | null,
  projectId: null as string | null,
  frequency: "monthly" as RecurringTransaction["frequency"],
  startDate: new Date().toISOString().split("T")[0],
  endDate: null as string | null,
  currency: "THB",
};

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { isPro, mounted: planMounted } = usePlan();
  const { locale, t } = useLocale();

  const FREQ_LABELS: Record<string, string> = {
    daily: t("recurring", "daily"),
    weekly: t("recurring", "weekly"),
    monthly: t("recurring", "monthly"),
    yearly: t("recurring", "yearly"),
  };

  useEffect(() => {
    setItems(getRecurringTransactions());
    setClients(getClients());
    setProjects(getProjects());
    setMounted(true);
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.amount || form.amount <= 0) errs.amount = t("recurring", "errAmount");
    if (!form.description.trim()) errs.description = t("recurring", "errDescription");
    if (!form.startDate) errs.startDate = t("recurring", "errStartDate");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const rt: RecurringTransaction = {
      id: editingId || crypto.randomUUID(),
      type: form.type,
      amount: Number(form.amount),
      description: form.description.trim(),
      category: form.category,
      clientId: form.clientId,
      projectId: form.projectId,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate,
      active: true,
      lastGenerated: editingId ? items.find((i) => i.id === editingId)?.lastGenerated || null : null,
      currency: form.currency,
    };

    saveRecurringTransaction(rt);
    setItems(getRecurringTransactions());
    resetForm();
    toast(editingId ? t("recurring", "editedSuccess") : t("recurring", "addedSuccess"));
  };

  const handleEdit = (rt: RecurringTransaction) => {
    setForm({
      type: rt.type,
      amount: rt.amount,
      description: rt.description,
      category: rt.category,
      clientId: rt.clientId,
      projectId: rt.projectId,
      frequency: rt.frequency,
      startDate: rt.startDate,
      endDate: rt.endDate,
      currency: rt.currency || "THB",
    });
    setEditingId(rt.id);
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t("recurring", "deleteRecurring"),
      message: t("recurring", "deleteConfirm"),
      confirmText: t("recurring", "deleteRecurring"),
      variant: "danger",
    });
    if (!ok) return;
    deleteRecurringTransaction(id);
    setItems(getRecurringTransactions());
    toast(t("recurring", "deletedSuccess"));
  };

  const handleToggle = (rt: RecurringTransaction) => {
    saveRecurringTransaction({ ...rt, active: !rt.active });
    setItems(getRecurringTransactions());
    toast(rt.active ? t("recurring", "paused") : t("recurring", "resumed"));
  };

  const handleProcess = () => {
    const count = processRecurringTransactions();
    setItems(getRecurringTransactions());
    if (count > 0) {
      toast(`${t("recurring", "generated")} ${count} ${t("recurring", "generatedEntries")}`);
    } else {
      toast(t("recurring", "noNewEntries"), "info");
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm, currency: getDefaultCurrency() });
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  if (!mounted || !planMounted) return null;

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("recurring", "title")}</h1>
          <p className="text-muted text-sm mt-1">{t("recurring", "subtitle")}</p>
        </div>
        <UpgradePrompt
          feature={t("recurring", "upgradeFeature")}
          description={t("recurring", "upgradeDesc")}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">{t("recurring", "previewAuto")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("recurring", "previewAutoDesc")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-sm">{t("recurring", "previewPauseResume")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("recurring", "previewPauseDesc")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-sm">{t("recurring", "previewEdit")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("recurring", "previewEditDesc")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-danger" />
              <h3 className="font-semibold text-sm">{t("recurring", "previewLink")}</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t("recurring", "previewLinkDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("recurring", "title")}</h1>
          <p className="text-muted text-sm mt-1">{t("recurring", "subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleProcess}
            className="bg-secondary hover:bg-border text-foreground px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {t("recurring", "generate")}
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("recurring", "add")}
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingId ? t("recurring", "editRecurring") : t("recurring", "addRecurring")}
              </h2>
              <button onClick={resetForm} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                {(["income", "expense"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, type })}
                    className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${
                      form.type === type
                        ? type === "income"
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : "bg-danger/10 text-danger border border-danger/30"
                        : "bg-secondary text-muted border border-border"
                    }`}
                  >
                    {type === "income" ? t("recurring", "income") : t("recurring", "expense")}
                  </button>
                ))}
              </div>

              {/* Amount + Currency */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">{t("recurring", "amount")}</label>
                  <input
                    type="number"
                    value={form.amount || ""}
                    onChange={(e) => { setForm({ ...form, amount: Number(e.target.value) }); setErrors({ ...errors, amount: "" }); }}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.amount ? "border-danger" : "border-border"}`}
                  />
                  {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount}</p>}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1.5">{t("recurring", "currency")}</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("recurring", "description")}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }}
                  placeholder={t("recurring", "descPlaceholder")}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? "border-danger" : "border-border"}`}
                />
                {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("recurring", "frequency")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setForm({ ...form, frequency: freq })}
                      className={`py-2 rounded-xl text-xs font-medium transition border ${
                        form.frequency === freq
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-secondary text-muted border-border"
                      }`}
                    >
                      {FREQ_LABELS[freq]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("recurring", "startDate")}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("recurring", "endDate")}</label>
                  <input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Category */}
              {form.type === "expense" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("recurring", "category")}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("recurring", "selectCategory")}</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Client */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("recurring", "client")}</label>
                <select
                  value={form.clientId || ""}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("recurring", "noClient")}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                {editingId ? t("recurring", "save") : t("recurring", "addRecurring")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-muted/30" />
          <p className="text-lg font-medium mb-1">{t("recurring", "noRecurring")}</p>
          <p className="text-sm text-muted">{t("recurring", "addFirstRecurring")}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {items.map((rt) => (
            <div key={rt.id} className={`flex items-center justify-between p-4 hover:bg-card-hover transition ${!rt.active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  rt.type === "income" ? "bg-accent/10" : "bg-danger/10"
                }`}>
                  <RefreshCw className={`w-4 h-4 ${rt.type === "income" ? "text-accent" : "text-danger"}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{rt.description}</p>
                  <p className="text-xs text-muted">
                    {FREQ_LABELS[rt.frequency]} · {t("recurring", "start")} {rt.startDate}
                    {rt.endDate && ` · ${t("recurring", "end")} ${rt.endDate}`}
                    {rt.category && ` · ${rt.category}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold whitespace-nowrap ${
                  rt.type === "income" ? "text-accent" : "text-danger"
                }`}>
                  {rt.type === "income" ? "+" : "-"}
                  {formatCurrency(rt.amount, rt.currency || "THB")}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggle(rt)}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                    title={rt.active ? t("recurring", "pause") : t("recurring", "resume")}
                  >
                    {rt.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(rt)}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rt.id)}
                    className="p-1.5 text-muted hover:text-danger hover:bg-secondary rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
