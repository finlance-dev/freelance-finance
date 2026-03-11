"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  FileText,
  Download,
  Trash2,
  X,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getClients, getProjects, getPromptPayId } from "@/lib/store";
import { generatePromptPayQRDataURL, isValidPromptPayId } from "@/lib/promptpay";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Client, Project } from "@/lib/types";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";
import { usePlan } from "@/hooks/usePlan";
import { UpgradePrompt } from "@/components/upgrade-prompt";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string | null;
  items: InvoiceItem[];
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = "ff_invoices";

function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(getInvoices().length + 1).padStart(4, "0");
  return `INV-${y}${m}-${seq}`;
}

const statusConfig = {
  draft: { label: "แบบร่าง", color: "text-muted bg-secondary", icon: FileText },
  sent: { label: "ส่งแล้ว", color: "text-primary bg-primary/10", icon: Clock },
  paid: { label: "ชำระแล้ว", color: "text-accent bg-accent/10", icon: CheckCircle2 },
  overdue: { label: "เลยกำหนด", color: "text-danger bg-danger/10", icon: AlertCircle },
};

const emptyItem: InvoiceItem = { description: "", quantity: 1, unitPrice: 0 };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    clientId: "",
    projectId: "" as string | null,
    items: [{ ...emptyItem }] as InvoiceItem[],
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    notes: "",
    status: "draft" as Invoice["status"],
  });

  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { isPro, mounted: planMounted } = usePlan();

  useEffect(() => {
    setInvoices(getInvoices());
    setClients(getClients());
    setProjects(getProjects());
    setMounted(true);
  }, []);

  const getTotal = (items: InvoiceItem[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || "-";

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.clientId) errs.clientId = "กรุณาเลือกลูกค้า";
    if (!form.issueDate) errs.issueDate = "กรุณาระบุวันที่ออก";
    if (!form.dueDate) errs.dueDate = "กรุณาระบุวันครบกำหนด";
    if (form.items.length === 0 || form.items.every((i) => !i.description.trim()))
      errs.items = "กรุณาเพิ่มรายการอย่างน้อย 1 รายการ";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const invoice: Invoice = {
      id: editingId || crypto.randomUUID(),
      invoiceNumber: editingId
        ? invoices.find((i) => i.id === editingId)!.invoiceNumber
        : generateInvoiceNumber(),
      clientId: form.clientId,
      projectId: form.projectId || null,
      items: form.items.filter((i) => i.description.trim()),
      status: form.status,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      notes: form.notes,
      createdAt: editingId
        ? invoices.find((i) => i.id === editingId)!.createdAt
        : new Date().toISOString(),
    };

    const updated = editingId
      ? invoices.map((i) => (i.id === editingId ? invoice : i))
      : [...invoices, invoice];

    saveInvoices(updated);
    setInvoices(updated);
    resetForm();
    toast(editingId ? "แก้ไขใบแจ้งหนี้สำเร็จ" : "สร้างใบแจ้งหนี้สำเร็จ");
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "ลบใบแจ้งหนี้",
      message: "คุณแน่ใจหรือไม่ว่าต้องการลบใบแจ้งหนี้นี้?",
      confirmText: "ลบ",
      variant: "danger",
    });
    if (!ok) return;
    const updated = invoices.filter((i) => i.id !== id);
    saveInvoices(updated);
    setInvoices(updated);
    toast("ลบใบแจ้งหนี้สำเร็จ");
  };

  const handleStatusChange = (id: string, status: Invoice["status"]) => {
    const updated = invoices.map((i) => (i.id === id ? { ...i, status } : i));
    saveInvoices(updated);
    setInvoices(updated);
    toast(`เปลี่ยนสถานะเป็น "${statusConfig[status].label}"`);
  };

  const resetForm = () => {
    setForm({
      clientId: "",
      projectId: null,
      items: [{ ...emptyItem }],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      notes: "",
      status: "draft",
    });
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  const handleEdit = (inv: Invoice) => {
    setForm({
      clientId: inv.clientId,
      projectId: inv.projectId,
      items: inv.items.length > 0 ? inv.items : [{ ...emptyItem }],
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      notes: inv.notes,
      status: inv.status,
    });
    setEditingId(inv.id);
    setErrors({});
    setShowForm(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const handleDownloadPDF = async (inv: Invoice) => {
    const client = clients.find((c) => c.id === inv.clientId);
    const total = getTotal(inv.items);

    const user = JSON.parse(localStorage.getItem("ff_user") || "{}");
    const profile = JSON.parse(localStorage.getItem("ff_user_profile") || "{}");
    const userName = profile.businessName || profile.name || user.name || "FreelanceFlow";
    const userEmail = profile.email || user.email || "";
    const userPhone = profile.phone || "";
    const userAddress = profile.address || "";
    const userTaxId = profile.taxId || "";
    const bankName = profile.bankName || "";
    const bankAccount = profile.bankAccount || "";

    const ppId = getPromptPayId();
    let qrDataUrl = "";
    if (ppId && isValidPromptPayId(ppId)) {
      try {
        qrDataUrl = await generatePromptPayQRDataURL(ppId, total);
      } catch { /* ignore */ }
    }

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Noto Sans Thai',sans-serif;color:#1e293b;background:#fff}
  .page{max-width:800px;margin:0 auto;padding:48px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;padding-bottom:32px;border-bottom:3px solid #6366f1}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-icon{width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700}
  .brand-name{font-size:24px;font-weight:700;color:#1e293b}
  .brand-sub{font-size:13px;color:#94a3b8;margin-top:2px}
  .inv-meta{text-align:right}
  .inv-number{font-size:20px;font-weight:700;color:#6366f1;margin-bottom:8px}
  .inv-date{font-size:13px;color:#64748b;line-height:1.8}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:40px}
  .party-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;margin-bottom:8px}
  .party-name{font-size:18px;font-weight:600;color:#1e293b;margin-bottom:4px}
  .party-email{font-size:13px;color:#64748b}
  .status-badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-top:8px}
  .status-paid{background:#dcfce7;color:#16a34a}
  .status-sent{background:#dbeafe;color:#2563eb}
  .status-draft{background:#f1f5f9;color:#64748b}
  .status-overdue{background:#fef2f2;color:#dc2626}
  table{width:100%;border-collapse:collapse;margin-bottom:32px}
  thead th{background:#f8fafc;padding:14px 16px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0}
  thead th:first-child{text-align:left;border-radius:8px 0 0 0}
  thead th:last-child{border-radius:0 8px 0 0}
  tbody td{padding:14px 16px;font-size:14px;border-bottom:1px solid #f1f5f9;color:#334155}
  tbody tr:hover{background:#fafbfc}
  .text-right{text-align:right}
  .total-section{display:flex;justify-content:flex-end;margin-bottom:40px}
  .total-box{width:280px}
  .total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#64748b}
  .total-row.grand{padding:14px 0;margin-top:8px;border-top:2px solid #1e293b;font-size:18px;font-weight:700;color:#1e293b}
  .notes{padding:20px;background:#f8fafc;border-radius:12px;border-left:4px solid #6366f1;margin-bottom:40px}
  .notes-label{font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#6366f1;font-weight:600;margin-bottom:8px}
  .notes-text{font-size:13px;color:#64748b;line-height:1.6}
  .footer{text-align:center;padding-top:32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px}
  .footer strong{color:#64748b}
  @media print{.page{padding:24px}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-icon">$</div>
      <div>
        <div class="brand-name">${userName}</div>
        <div class="brand-sub">${userEmail}${userPhone ? ` · ${userPhone}` : ""}</div>
      </div>
    </div>
    <div class="inv-meta">
      <div class="inv-number">${inv.invoiceNumber}</div>
      <div class="inv-date">
        วันที่ออก: ${formatDate(inv.issueDate)}<br>
        ครบกำหนด: ${formatDate(inv.dueDate)}
      </div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-label">ผู้ออกใบแจ้งหนี้</div>
      <div class="party-name">${userName}</div>
      ${userEmail ? `<div class="party-email">${userEmail}</div>` : ""}
      ${userPhone ? `<div class="party-email">${userPhone}</div>` : ""}
      ${userAddress ? `<div class="party-email" style="margin-top:4px">${userAddress}</div>` : ""}
      ${userTaxId ? `<div class="party-email" style="margin-top:4px">เลขประจำตัวผู้เสียภาษี: ${userTaxId}</div>` : ""}
    </div>
    <div>
      <div class="party-label">เรียกเก็บจาก</div>
      <div class="party-name">${client?.name || "-"}</div>
      ${client?.email ? `<div class="party-email">${client.email}</div>` : ""}
      <span class="status-badge status-${inv.status}">${statusConfig[inv.status].label}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50%">รายการ</th>
        <th class="text-right" style="width:15%">จำนวน</th>
        <th class="text-right" style="width:17%">ราคา/หน่วย</th>
        <th class="text-right" style="width:18%">รวม</th>
      </tr>
    </thead>
    <tbody>
      ${inv.items.map((item, idx) => `
      <tr>
        <td><strong>${idx + 1}.</strong> ${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unitPrice)}</td>
        <td class="text-right"><strong>${formatCurrency(item.quantity * item.unitPrice)}</strong></td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="total-row">
        <span>รวมย่อย (${inv.items.length} รายการ)</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <div class="total-row grand">
        <span>ยอดรวมทั้งสิ้น</span>
        <span>${formatCurrency(total)}</span>
      </div>
    </div>
  </div>

  ${inv.notes ? `
  <div class="notes">
    <div class="notes-label">หมายเหตุ</div>
    <div class="notes-text">${inv.notes}</div>
  </div>` : ""}

  ${bankName && bankAccount ? `
  <div style="margin-bottom:24px;padding:20px;background:#f8fafc;border-radius:12px;border-left:4px solid #6366f1">
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#6366f1;font-weight:600;margin-bottom:10px">ข้อมูลการชำระเงิน</div>
    <div style="font-size:14px;color:#334155;line-height:1.8">
      <strong>ธนาคาร:</strong> ${bankName}<br>
      <strong>เลขบัญชี:</strong> ${bankAccount}<br>
      <strong>ชื่อบัญชี:</strong> ${profile.name || user.name || userName}
    </div>
  </div>` : ""}

  ${qrDataUrl ? `
  <div class="promptpay-section" style="text-align:center;margin-bottom:40px;padding:24px;background:#f8fafc;border-radius:12px;border:2px dashed #6366f1">
    <div style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:12px">ชำระเงินผ่าน PromptPay</div>
    <img src="${qrDataUrl}" alt="PromptPay QR" style="width:200px;height:200px;margin:0 auto;display:block" />
    <div style="margin-top:12px;font-size:13px;color:#64748b">สแกน QR Code เพื่อชำระ <strong style="color:#1e293b">${formatCurrency(total)}</strong></div>
    <div style="margin-top:4px;font-size:11px;color:#94a3b8">PromptPay ID: ${ppId.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}</div>
  </div>` : ""}

  <div class="footer">
    สร้างโดย <strong>FreelanceFlow</strong> · ขอบคุณที่ใช้บริการ
  </div>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast("ดาวน์โหลดใบแจ้งหนี้สำเร็จ");
  };

  const previewInvoice = previewId ? invoices.find((i) => i.id === previewId) : null;

  if (!mounted || !planMounted) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-36 bg-secondary rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
              <div className="h-5 w-40 bg-secondary rounded mb-2" />
              <div className="h-4 w-28 bg-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ใบแจ้งหนี้</h1>
          <p className="text-muted text-sm mt-1">สร้างและจัดการใบแจ้งหนี้</p>
        </div>
        <UpgradePrompt
          feature="ใบแจ้งหนี้"
          description="สร้างใบแจ้งหนี้แบบมืออาชีพพร้อม PromptPay QR ส่งให้ลูกค้าได้ทันที อัปเกรดเป็นโปรเพื่อปลดล็อค"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">สร้างใบแจ้งหนี้</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              สร้างใบแจ้งหนี้แบบมืออาชีพ กรอกรายการสินค้า/บริการ ระบบคำนวณยอดรวมให้อัตโนมัติ พร้อมเลขที่ใบแจ้งหนี้ที่เรียงลำดับ
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-sm">ดาวน์โหลด PDF</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ดาวน์โหลดใบแจ้งหนี้เป็น PDF พร้อม PromptPay QR Code ส่งให้ลูกค้าชำระเงินได้สะดวก รวดเร็ว
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-sm">ติดตามสถานะ</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ติดตามสถานะใบแจ้งหนี้ทุกใบ ตั้งแต่แบบร่าง ส่งแล้ว ชำระแล้ว จนถึงเลยกำหนด พร้อมแจ้งเตือนอัตโนมัติ
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 opacity-80">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-danger" />
              <h3 className="font-semibold text-sm">ดูตัวอย่างก่อนส่ง</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ดูตัวอย่างใบแจ้งหนี้ก่อนส่งให้ลูกค้า มีข้อมูลธุรกิจ ที่อยู่ และรายละเอียดครบถ้วน
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
          <h1 className="text-2xl font-bold">ใบแจ้งหนี้</h1>
          <p className="text-muted text-sm mt-1">สร้างและจัดการใบแจ้งหนี้</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          สร้างใบแจ้งหนี้
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["draft", "sent", "paid", "overdue"] as const).map((status) => {
          const cfg = statusConfig[status];
          const count = invoices.filter((i) => i.status === status).length;
          const Icon = cfg.icon;
          return (
            <div key={status} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${cfg.color.split(" ")[0]}`} />
                <span className="text-sm text-muted">{cfg.label}</span>
              </div>
              <p className="text-xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingId ? "แก้ไขใบแจ้งหนี้" : "สร้างใบแจ้งหนี้ใหม่"}
              </h2>
              <button onClick={resetForm} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium mb-1.5">ลูกค้า</label>
                <select
                  value={form.clientId}
                  onChange={(e) => { setForm({ ...form, clientId: e.target.value }); setErrors({ ...errors, clientId: "" }); }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.clientId ? "border-danger" : "border-border"}`}
                >
                  <option value="">เลือกลูกค้า</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-danger text-xs mt-1">{errors.clientId}</p>}
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium mb-1.5">โปรเจกต์ (ไม่บังคับ)</label>
                <select
                  value={form.projectId || ""}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">ไม่ระบุโปรเจกต์</option>
                  {projects.filter((p) => !form.clientId || p.clientId === form.clientId).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">วันที่ออก</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">วันครบกำหนด</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium mb-1.5">รายการ</label>
                {errors.items && <p className="text-danger text-xs mb-2">{errors.items}</p>}
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="รายละเอียด"
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                        placeholder="จำนวน"
                        className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="number"
                        value={item.unitPrice || ""}
                        onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                        placeholder="ราคา"
                        className="w-28 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="p-2 text-muted hover:text-danger">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="mt-2 text-sm text-primary hover:text-primary-dark font-medium">
                  + เพิ่มรายการ
                </button>
                <div className="mt-3 text-right">
                  <span className="text-sm text-muted">ยอดรวม: </span>
                  <span className="text-lg font-bold">{formatCurrency(getTotal(form.items))}</span>
                </div>
              </div>

              {/* Status */}
              {editingId && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">สถานะ</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Invoice["status"] })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">แบบร่าง</option>
                    <option value="sent">ส่งแล้ว</option>
                    <option value="paid">ชำระแล้ว</option>
                    <option value="overdue">เลยกำหนด</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1.5">หมายเหตุ (ไม่บังคับ)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="ข้อมูลเพิ่มเติม เช่น เงื่อนไขการชำระ"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
              >
                {editingId ? "บันทึกการเปลี่ยนแปลง" : "สร้างใบแจ้งหนี้"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{previewInvoice.invoiceNumber}</h2>
              <button onClick={() => setPreviewId(null)} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted">ลูกค้า</p>
                  <p className="font-medium">{getClientName(previewInvoice.clientId)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted">วันที่</p>
                  <p className="font-medium">{formatDate(previewInvoice.issueDate)}</p>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="text-left px-3 py-2 font-medium text-muted">รายการ</th>
                      <th className="text-right px-3 py-2 font-medium text-muted">จำนวน</th>
                      <th className="text-right px-3 py-2 font-medium text-muted">ราคา</th>
                      <th className="text-right px-3 py-2 font-medium text-muted">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-secondary rounded-xl px-4 py-3">
                <span className="font-medium">ยอดรวมทั้งสิ้น</span>
                <span className="text-xl font-bold">{formatCurrency(getTotal(previewInvoice.items))}</span>
              </div>

              {previewInvoice.notes && (
                <div className="text-sm text-muted bg-secondary/50 rounded-xl p-3">
                  <strong>หมายเหตุ:</strong> {previewInvoice.notes}
                </div>
              )}

              <button
                onClick={() => { handleDownloadPDF(previewInvoice); setPreviewId(null); }}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted/30" />
          <p className="text-lg font-medium mb-1">ยังไม่มีใบแจ้งหนี้</p>
          <p className="text-sm text-muted">สร้างใบแจ้งหนี้แรกเพื่อเริ่มเรียกเก็บเงินลูกค้า</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {invoices
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((inv) => {
              const cfg = statusConfig[inv.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-card-hover transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color.split(" ").slice(1).join(" ")}`}>
                      <StatusIcon className={`w-4 h-4 ${cfg.color.split(" ")[0]}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted">
                        {getClientName(inv.clientId)} · {formatDate(inv.issueDate)} · ครบกำหนด {formatDate(inv.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(getTotal(inv.items))}</p>
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value as Invoice["status"])}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs px-2 py-0.5 rounded-full border-0 ${cfg.color} cursor-pointer`}
                      >
                        <option value="draft">แบบร่าง</option>
                        <option value="sent">ส่งแล้ว</option>
                        <option value="paid">ชำระแล้ว</option>
                        <option value="overdue">เลยกำหนด</option>
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreviewId(inv.id)}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(inv)}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
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
    </div>
  );
}
