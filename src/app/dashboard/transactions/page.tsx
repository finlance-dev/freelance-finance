"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  Download,
  FileText,
  Lock,
  AlertTriangle,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import {
  getTransactions,
  saveTransaction,
  deleteTransaction,
  getClients,
  getProjects,
  getDefaultCurrency,
  getCategories,
  saveCategory,
  deleteCategory as removeCategory,
  renameCategory,
} from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, Client, Project } from "@/lib/types";
import { SUPPORTED_CURRENCIES } from "@/lib/types";
import { EmptyTransactionsIllustration } from "@/components/illustrations";
import { usePlan } from "@/hooks/usePlan";
import { exportTransactionsCSV, exportTransactionsPDF } from "@/lib/export";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";
import { useLocale } from "@/hooks/useLocale";

const DEFAULT_CATEGORIES: string[] = [];

function getEmptyTx(): Omit<Transaction, "id"> {
  return {
    type: "income",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    projectId: null,
    clientId: null,
    currency: typeof window !== "undefined" ? getDefaultCurrency() : "THB",
    withholdingTax: 0,
  };
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary" />
        <div>
          <div className="h-4 w-40 bg-secondary rounded mb-1.5" />
          <div className="h-3 w-24 bg-secondary rounded" />
        </div>
      </div>
      <div className="h-5 w-20 bg-secondary rounded" />
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(getEmptyTx());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [filterClient, setFilterClient] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { isPro, canAddTransaction, transactionsRemaining } = usePlan();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLocale();

  useEffect(() => {
    setTransactions(getTransactions());
    setClients(getClients());
    setProjects(getProjects());
    setCategories([...DEFAULT_CATEGORIES, ...getCategories()]);
    setMounted(true);
  }, []);

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      toast(t("transactions", "catExists"), "warning");
      return;
    }
    saveCategory(name);
    setCategories([...categories, name]);
    setNewCategoryName("");
    setShowCategoryForm(false);
    toast(t("transactions", "catAdded"));
  };

  const handleDeleteCategory = async (name: string) => {
    if (DEFAULT_CATEGORIES.includes(name)) return;
    const ok = await confirm({ title: t("transactions", "deleteCategory"), message: `${t("transactions", "deleteCategoryConfirm")} "${name}"?`, variant: "danger" });
    if (!ok) return;
    removeCategory(name);
    setCategories(categories.filter((c) => c !== name));
    if (form.category === name) setForm({ ...form, category: "" });
    toast(t("transactions", "catDeleted"));
  };

  const handleEditCategory = (name: string) => {
    setEditingCat(name);
    setEditingCatName(name);
  };

  const handleSaveEditCategory = () => {
    const newName = editingCatName.trim();
    if (!newName || !editingCat) return;
    if (newName === editingCat) { setEditingCat(null); return; }
    if (categories.includes(newName)) {
      toast(t("transactions", "catExists"), "warning");
      return;
    }
    renameCategory(editingCat, newName);
    setCategories(categories.map((c) => (c === editingCat ? newName : c)));
    if (form.category === editingCat) setForm({ ...form, category: newName });
    setTransactions(getTransactions());
    setEditingCat(null);
    toast(t("transactions", "catEdited"));
  };

  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filterType !== "all" && tx.type !== filterType) return false;
        if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterClient && tx.clientId !== filterClient) return false;
        if (filterCategory && tx.category !== filterCategory) return false;
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo && tx.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, search, filterClient, filterCategory, dateFrom, dateTo]);

  const hasActiveFilters = search || filterType !== "all" || filterClient || filterCategory || dateFrom || dateTo;

  const clearAllFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterClient("");
    setFilterCategory("");
    setDateFrom("");
    setDateTo("");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.amount || form.amount <= 0) newErrors.amount = t("transactions", "errAmount");
    if (!form.description.trim()) newErrors.description = t("transactions", "errDescription");
    if (!form.date) newErrors.date = t("transactions", "errDate");
    if (form.type === "expense" && !form.category) newErrors.category = t("transactions", "errCategory");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (!editingId && !canAddTransaction()) {
      toast(t("transactions", "freeLimitWarning"), "warning");
      return;
    }

    const tx: Transaction = {
      ...form,
      id: editingId || crypto.randomUUID(),
      amount: Number(form.amount),
    };
    saveTransaction(tx);
    setTransactions(getTransactions());
    resetForm();
    toast(editingId ? t("transactions", "editedSuccess") : t("transactions", "addedSuccess"));
  };

  const handleEdit = (tx: Transaction) => {
    setForm(tx);
    setEditingId(tx.id);
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t("transactions", "deleteEntry"),
      message: t("transactions", "deleteEntryConfirm"),
      confirmText: t("common", "delete"),
      variant: "danger",
    });
    if (!ok) return;
    deleteTransaction(id);
    setTransactions(getTransactions());
    toast(t("transactions", "deletedSuccess"));
  };

  const resetForm = () => {
    setForm(getEmptyTx());
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  const getClientName = (id: string | null) => clients.find((c) => c.id === id)?.name || "-";
  const getProjectName = (id: string | null) => projects.find((p) => p.id === id)?.name || "-";

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-48 bg-secondary rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
              <div className="h-3 w-16 bg-secondary rounded mb-2" />
              <div className="h-6 w-24 bg-secondary rounded" />
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  const remaining = transactionsRemaining();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("transactions", "title")}</h1>
          <p className="text-muted text-sm mt-1">{t("transactions", "subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {isPro && filtered.length > 0 && (
            <>
              <button
                onClick={() => exportTransactionsCSV(filtered)}
                className="bg-secondary hover:bg-border text-foreground px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 text-sm"
                title={t("transactions", "exportCSV")}
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => exportTransactionsPDF(filtered)}
                className="bg-secondary hover:bg-border text-foreground px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 text-sm"
                title={t("transactions", "exportPDF")}
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </>
          )}
          {!isPro && filtered.length > 0 && (
            <button
              disabled
              className="bg-secondary text-muted px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 text-sm cursor-not-allowed opacity-60"
              title={t("transactions", "upgradeToExport")}
            >
              <Lock className="w-3.5 h-3.5" />
              {t("transactions", "export")}
            </button>
          )}
          <button
            onClick={() => {
              if (!canAddTransaction()) {
                toast(t("transactions", "freeLimitWarning"), "warning");
                return;
              }
              setShowForm(true);
              setEditingId(null);
              setForm(getEmptyTx());
              setErrors({});
            }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("transactions", "addEntry")}
          </button>
        </div>
      </div>

      {/* Free plan limit warning */}
      {!isPro && remaining !== Infinity && remaining <= 10 && remaining > 0 && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t("transactions", "remainingEntries")} {remaining} {t("transactions", "freeLimitNote")}</span>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingId ? t("transactions", "editEntry") : t("transactions", "addEntry")}
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
                    onClick={() => setForm({ ...form, type, category: type === "income" ? "" : form.category })}
                    className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${
                      form.type === type
                        ? type === "income"
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : "bg-danger/10 text-danger border border-danger/30"
                        : "bg-secondary text-muted border border-border"
                    }`}
                  >
                    {type === "income" ? t("transactions", "income") : t("transactions", "expense")}
                  </button>
                ))}
              </div>

              {/* Amount + Currency */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">{t("transactions", "amount")}</label>
                  <input
                    type="number"
                    value={form.amount || ""}
                    onChange={(e) => { setForm({ ...form, amount: Number(e.target.value) }); setErrors({ ...errors, amount: "" }); }}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.amount ? "border-danger" : "border-border"}`}
                  />
                  {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount}</p>}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1.5">{t("transactions", "currency")}</label>
                  <select
                    value={form.currency || "THB"}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Withholding Tax (income only) */}
              {form.type === "income" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium">{t("transactions", "wht")}</label>
                    <button
                      type="button"
                      onClick={() => {
                        const wht = Math.round(form.amount * 0.03 * 100) / 100;
                        setForm({ ...form, withholdingTax: wht });
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {t("transactions", "calc3pct")}
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={form.withholdingTax || ""}
                      onChange={(e) => setForm({ ...form, withholdingTax: Number(e.target.value) })}
                      placeholder="0"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-muted whitespace-nowrap">{t("transactions", "baht")}</span>
                  </div>
                  {form.withholdingTax ? (
                    <p className="text-xs text-muted mt-1">
                      {t("transactions", "netIncome")} {formatCurrency(form.amount - (form.withholdingTax || 0))} {t("transactions", "afterWHT")}
                    </p>
                  ) : null}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("transactions", "description")}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }}
                  placeholder={t("transactions", "descPlaceholder")}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? "border-danger" : "border-border"}`}
                />
                {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("transactions", "date")}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: "" }); }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.date ? "border-danger" : "border-border"}`}
                />
                {errors.date && <p className="text-danger text-xs mt-1">{errors.date}</p>}
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("transactions", "client")}</label>
                <select
                  value={form.clientId || ""}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("transactions", "noClient")}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("transactions", "project")}</label>
                <select
                  value={form.projectId || ""}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("transactions", "noProject")}</option>
                  {projects
                    .filter((p) => !form.clientId || p.clientId === form.clientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>

              {/* Category */}
              {(form.type === "expense" || form.type === "income") && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium">{t("transactions", "category")}</label>
                    <div className="flex items-center gap-2">
                      {categories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowCategoryManager(!showCategoryManager)}
                          className="text-xs text-muted hover:text-foreground"
                        >
                          {showCategoryManager ? t("transactions", "hide") : t("transactions", "manage")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(!showCategoryForm)}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("transactions", "addCategory")}
                      </button>
                    </div>
                  </div>
                  {showCategoryForm && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={t("transactions", "newCatPlaceholder")}
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
                      >
                        {t("common", "add")}
                      </button>
                    </div>
                  )}
                  {showCategoryManager && categories.length > 0 && (
                    <div className="mb-2 border border-border rounded-xl divide-y divide-border overflow-hidden">
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center gap-2 px-3 py-2 text-sm">
                          {editingCat === cat ? (
                            <>
                              <input
                                type="text"
                                value={editingCatName}
                                onChange={(e) => setEditingCatName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSaveEditCategory(); if (e.key === "Escape") setEditingCat(null); }}
                                className="flex-1 px-2 py-1 rounded-lg border border-primary bg-background text-sm focus:outline-none"
                                autoFocus
                              />
                              <button type="button" onClick={handleSaveEditCategory} className="text-accent hover:text-accent/80 p-1">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => setEditingCat(null)} className="text-muted hover:text-foreground p-1">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 truncate">{cat}</span>
                              {!DEFAULT_CATEGORIES.includes(cat) && (
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => handleEditCategory(cat)} className="text-muted hover:text-primary p-1">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteCategory(cat)} className="text-muted hover:text-danger p-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <select
                    value={form.category}
                    onChange={(e) => { setForm({ ...form, category: e.target.value }); setErrors({ ...errors, category: "" }); }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.category ? "border-danger" : "border-border"}`}
                  >
                    <option value="">{t("transactions", "selectCategory")}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-danger text-xs mt-1">{errors.category}</p>}
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                {editingId ? t("transactions", "saveChanges") : t("transactions", "addEntry")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("transactions", "search")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filterType === type
                    ? "bg-primary/10 text-primary"
                    : "bg-card border border-border text-muted hover:text-foreground"
                }`}
              >
                {type === "all" ? t("transactions", "all") : type === "income" ? t("transactions", "income") : t("transactions", "expense")}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <CalendarIcon className="w-4 h-4 text-muted shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-muted text-sm">{t("transactions", "toDate")}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("transactions", "allClients")}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("transactions", "allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 transition whitespace-nowrap"
            >
              <Filter className="w-3.5 h-3.5" />
              {t("transactions", "clearFilters")}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm text-muted">{t("transactions", "totalIncome")}</p>
          <p className="text-xl font-bold text-accent">
            {formatCurrency(
              filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm text-muted">{t("transactions", "totalExpenses")}</p>
          <p className="text-xl font-bold text-danger">
            {formatCurrency(
              filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-sm text-muted">{t("transactions", "entryCount")}</p>
          <p className="text-xl font-bold">{filtered.length}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <EmptyTransactionsIllustration className="w-44 h-auto mx-auto mb-4" />
            <p className="text-lg mb-2">{t("transactions", "noEntries")}</p>
            <p className="text-sm">{t("transactions", "addFirstEntry")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-card-hover transition gap-2 sm:gap-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "income" ? "bg-accent/10" : "bg-danger/10"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-accent" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-danger" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted truncate">
                      {formatDate(tx.date)}
                      {tx.clientId && ` · ${getClientName(tx.clientId)}`}
                      {tx.projectId && ` · ${getProjectName(tx.projectId)}`}
                      {tx.category && ` · ${tx.category}`}
                      {tx.withholdingTax ? ` · WHT ${formatCurrency(tx.withholdingTax)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                  <span
                    className={`font-semibold whitespace-nowrap ${
                      tx.type === "income" ? "text-accent" : "text-danger"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount, tx.currency || "THB")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
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
    </div>
  );
}
