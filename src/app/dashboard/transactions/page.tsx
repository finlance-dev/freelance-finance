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
      toast("หมวดหมู่นี้มีอยู่แล้ว", "warning");
      return;
    }
    saveCategory(name);
    setCategories([...categories, name]);
    setNewCategoryName("");
    setShowCategoryForm(false);
    toast("เพิ่มหมวดหมู่สำเร็จ");
  };

  const handleDeleteCategory = async (name: string) => {
    if (DEFAULT_CATEGORIES.includes(name)) return;
    const ok = await confirm({ title: "ลบหมวดหมู่", message: `ต้องการลบหมวดหมู่ "${name}" หรือไม่?`, variant: "danger" });
    if (!ok) return;
    removeCategory(name);
    setCategories(categories.filter((c) => c !== name));
    if (form.category === name) setForm({ ...form, category: "" });
    toast("ลบหมวดหมู่สำเร็จ");
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
      toast("หมวดหมู่นี้มีอยู่แล้ว", "warning");
      return;
    }
    renameCategory(editingCat, newName);
    setCategories(categories.map((c) => (c === editingCat ? newName : c)));
    if (form.category === editingCat) setForm({ ...form, category: newName });
    setTransactions(getTransactions());
    setEditingCat(null);
    toast("แก้ไขหมวดหมู่สำเร็จ");
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
    if (!form.amount || form.amount <= 0) newErrors.amount = "กรุณาระบุจำนวนเงินที่มากกว่า 0";
    if (!form.description.trim()) newErrors.description = "กรุณาระบุรายละเอียด";
    if (!form.date) newErrors.date = "กรุณาระบุวันที่";
    if (form.type === "expense" && !form.category) newErrors.category = "กรุณาเลือกหมวดหมู่";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Check free plan limit (only for new transactions)
    if (!editingId && !canAddTransaction()) {
      toast("แพลนฟรีจำกัด 50 รายการ กรุณาอัปเกรดเป็นโปร", "warning");
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
    toast(editingId ? "แก้ไขรายการสำเร็จ" : "เพิ่มรายการสำเร็จ");
  };

  const handleEdit = (tx: Transaction) => {
    setForm(tx);
    setEditingId(tx.id);
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "ลบรายการ",
      message: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      confirmText: "ลบ",
      variant: "danger",
    });
    if (!ok) return;
    deleteTransaction(id);
    setTransactions(getTransactions());
    toast("ลบรายการสำเร็จ");
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
          <h1 className="text-2xl font-bold">รายการเงิน</h1>
          <p className="text-muted text-sm mt-1">ติดตามรายรับและรายจ่ายของคุณ</p>
        </div>
        <div className="flex gap-2">
          {isPro && filtered.length > 0 && (
            <>
              <button
                onClick={() => exportTransactionsCSV(filtered)}
                className="bg-secondary hover:bg-border text-foreground px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 text-sm"
                title="ส่งออก CSV"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => exportTransactionsPDF(filtered)}
                className="bg-secondary hover:bg-border text-foreground px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 text-sm"
                title="ส่งออก PDF"
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
              title="อัปเกรดเป็นโปรเพื่อส่งออก"
            >
              <Lock className="w-3.5 h-3.5" />
              ส่งออก
            </button>
          )}
          <button
            onClick={() => {
              if (!canAddTransaction()) {
                toast("แพลนฟรีจำกัด 50 รายการ กรุณาอัปเกรดเป็นโปร", "warning");
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
            เพิ่มรายการ
          </button>
        </div>
      </div>

      {/* Free plan limit warning */}
      {!isPro && remaining !== Infinity && remaining <= 10 && remaining > 0 && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>เหลือเพิ่มได้อีก {remaining} รายการ (แพลนฟรีจำกัด 50 รายการ)</span>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingId ? "แก้ไขรายการ" : "เพิ่มรายการ"}
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
                    {type === "income" ? "รายรับ" : "รายจ่าย"}
                  </button>
                ))}
              </div>

              {/* Amount + Currency */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">จำนวนเงิน</label>
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
                  <label className="block text-sm font-medium mb-1.5">สกุลเงิน</label>
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">รายละเอียด</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }}
                  placeholder="เช่น ออกแบบเว็บไซต์ให้ลูกค้า A"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? "border-danger" : "border-border"}`}
                />
                {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1.5">วันที่</label>
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
                <label className="block text-sm font-medium mb-1.5">ลูกค้า (ไม่บังคับ)</label>
                <select
                  value={form.clientId || ""}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">ไม่ระบุลูกค้า</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium mb-1.5">โปรเจกต์ (ไม่บังคับ)</label>
                <select
                  value={form.projectId || ""}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">ไม่ระบุโปรเจกต์</option>
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
                    <label className="block text-sm font-medium">หมวดหมู่</label>
                    <div className="flex items-center gap-2">
                      {categories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowCategoryManager(!showCategoryManager)}
                          className="text-xs text-muted hover:text-foreground"
                        >
                          {showCategoryManager ? "ซ่อน" : "จัดการ"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(!showCategoryForm)}
                        className="text-xs text-primary hover:underline"
                      >
                        + เพิ่มหมวดหมู่
                      </button>
                    </div>
                  </div>
                  {showCategoryForm && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="ชื่อหมวดหมู่ใหม่"
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
                      >
                        เพิ่ม
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
                              <button type="button" onClick={handleSaveEditCategory} className="text-accent hover:text-accent/80 p-1" title="บันทึก">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => setEditingCat(null)} className="text-muted hover:text-foreground p-1" title="ยกเลิก">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 truncate">{cat}</span>
                              {!DEFAULT_CATEGORIES.includes(cat) && (
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => handleEditCategory(cat)} className="text-muted hover:text-primary p-1" title="แก้ไข">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteCategory(cat)} className="text-muted hover:text-danger p-1" title="ลบ">
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
                    <option value="">เลือกหมวดหมู่</option>
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
                {editingId ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มรายการ"}
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
              placeholder="ค้นหารายการ..."
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
                {type === "all" ? "ทั้งหมด" : type === "income" ? "รายรับ" : "รายจ่าย"}
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
              placeholder="จากวันที่"
            />
            <span className="text-muted text-sm">ถึง</span>
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
            <option value="">ลูกค้าทั้งหมด</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">หมวดหมู่ทั้งหมด</option>
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
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm text-muted">รายรับรวม</p>
          <p className="text-xl font-bold text-accent">
            {formatCurrency(
              filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm text-muted">รายจ่ายรวม</p>
          <p className="text-xl font-bold text-danger">
            {formatCurrency(
              filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-sm text-muted">จำนวนรายการ</p>
          <p className="text-xl font-bold">{filtered.length}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <EmptyTransactionsIllustration className="w-44 h-auto mx-auto mb-4" />
            <p className="text-lg mb-2">ยังไม่มีรายการ</p>
            <p className="text-sm">กด &quot;เพิ่ม&quot; เพื่อบันทึกรายรับหรือรายจ่ายแรกของคุณ</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-card-hover transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
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
                    <p className="text-xs text-muted">
                      {formatDate(tx.date)}
                      {tx.clientId && ` · ${getClientName(tx.clientId)}`}
                      {tx.projectId && ` · ${getProjectName(tx.projectId)}`}
                      {tx.category && ` · ${tx.category}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
