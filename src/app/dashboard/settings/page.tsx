"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Upload,
  Cloud,
  CloudOff,
  Globe,
  Shield,
  Trash2,
  QrCode,
} from "lucide-react";
import {
  exportAllData,
  importAllData,
  isCloudEnabled,
  syncFromCloud,
  getDefaultCurrency,
  setDefaultCurrency,
  clearDemoData,
  getPromptPayId,
  setPromptPayId as storeSetPromptPayId,
} from "@/lib/store";
import { isValidPromptPayId } from "@/lib/promptpay";
import { SUPPORTED_CURRENCIES } from "@/lib/types";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState("THB");
  const [syncing, setSyncing] = useState(false);
  const [promptpayId, setPromptpayId] = useState("");
  const [promptpayError, setPromptpayError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    setCurrency(getDefaultCurrency());
    setPromptpayId(getPromptPayId());
    setMounted(true);
  }, []);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freelanceflow-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("ส่งออกข้อมูลสำเร็จ");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const ok = await confirm({
        title: "นำเข้าข้อมูล",
        message: "ข้อมูลปัจจุบันจะถูกแทนที่ด้วยข้อมูลจากไฟล์ คุณแน่ใจหรือไม่?",
        confirmText: "นำเข้า",
        variant: "warning",
      });
      if (!ok) return;

      const result = importAllData(text);
      if (result.success) {
        toast("นำเข้าข้อมูลสำเร็จ รีเฟรชหน้าเพื่อดูข้อมูลใหม่");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast(result.error || "นำเข้าไม่สำเร็จ", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSync = async () => {
    setSyncing(true);
    const ok = await syncFromCloud();
    setSyncing(false);
    if (ok) {
      toast("ซิงค์ข้อมูลจากคลาวด์สำเร็จ");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast("ซิงค์ไม่สำเร็จ ตรวจสอบการเชื่อมต่อ Supabase", "error");
    }
  };

  const handleSavePromptPay = () => {
    const clean = promptpayId.replace(/[-\s]/g, "");
    if (clean && !isValidPromptPayId(clean)) {
      setPromptpayError("กรุณาใส่เบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน/Tax ID (13 หลัก)");
      return;
    }
    setPromptpayError("");
    storeSetPromptPayId(clean);
    toast(clean ? "บันทึก PromptPay ID สำเร็จ" : "ลบ PromptPay ID สำเร็จ");
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    setDefaultCurrency(code);
    toast(`เปลี่ยนสกุลเงินเป็น ${code}`);
  };

  const handleClearDemo = async () => {
    const ok = await confirm({
      title: "ลบข้อมูลตัวอย่าง",
      message: "ลบข้อมูลตัวอย่างทั้งหมด (demo-) ข้อมูลจริงจะไม่ถูกลบ",
      confirmText: "ลบ",
      variant: "danger",
    });
    if (!ok) return;
    clearDemoData();
    toast("ลบข้อมูลตัวอย่างสำเร็จ");
    setTimeout(() => window.location.reload(), 1000);
  };

  if (!mounted) return null;

  const cloud = isCloudEnabled();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่า</h1>
        <p className="text-muted text-sm mt-1">จัดการข้อมูลและการตั้งค่าระบบ</p>
      </div>

      {/* Cloud Status */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          {cloud ? (
            <Cloud className="w-5 h-5 text-accent" />
          ) : (
            <CloudOff className="w-5 h-5 text-muted" />
          )}
          <h3 className="font-semibold">การเชื่อมต่อคลาวด์</h3>
        </div>
        {cloud ? (
          <div className="space-y-3">
            <p className="text-sm text-accent">เชื่อมต่อ Supabase แล้ว — ข้อมูลจะซิงค์อัตโนมัติ</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-sm bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              {syncing ? "กำลังซิงค์..." : "ซิงค์จากคลาวด์"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted">ไม่ได้เชื่อมต่อ — ข้อมูลเก็บในเบราว์เซอร์เท่านั้น</p>
            <p className="text-xs text-muted">
              ตั้งค่า <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> และ{" "}
              <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ใน{" "}
              <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">.env.local</code> เพื่อเปิดใช้คลาวด์
            </p>
          </div>
        )}
      </div>

      {/* Default Currency */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">สกุลเงินเริ่มต้น</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleCurrencyChange(c.code)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition border ${
                currency === c.code
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-secondary text-muted border-border hover:text-foreground"
              }`}
            >
              <span className="text-base">{c.symbol}</span>{" "}
              <span className="text-xs">{c.code}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">สกุลเงินเริ่มต้นสำหรับรายการใหม่</p>
      </div>

      {/* PromptPay */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <QrCode className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">PromptPay QR</h3>
        </div>
        <p className="text-sm text-muted mb-3">ใส่เบอร์โทรหรือเลขบัตรประชาชน เพื่อแสดง QR Code ในใบแจ้งหนี้</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={promptpayId}
            onChange={(e) => { setPromptpayId(e.target.value); setPromptpayError(""); }}
            placeholder="เช่น 0812345678 หรือ 1234567890123"
            className={`flex-1 px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm ${promptpayError ? "border-danger" : "border-border"}`}
          />
          <button
            onClick={handleSavePromptPay}
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition"
          >
            บันทึก
          </button>
        </div>
        {promptpayError && <p className="text-danger text-xs mt-1.5">{promptpayError}</p>}
        {!promptpayError && promptpayId && isValidPromptPayId(promptpayId) && (
          <p className="text-accent text-xs mt-1.5">PromptPay QR จะแสดงในใบแจ้งหนี้อัตโนมัติ</p>
        )}
      </div>

      {/* Backup & Restore */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">สำรองและกู้คืนข้อมูล</h3>
        </div>
        <p className="text-sm text-muted mb-4">ส่งออกข้อมูลทั้งหมดเป็น JSON หรือนำเข้าจากไฟล์สำรอง</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-accent/10 text-accent hover:bg-accent/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            ส่งออกข้อมูล
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Upload className="w-4 h-4" />
            นำเข้าข้อมูล
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-danger/30 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Trash2 className="w-5 h-5 text-danger" />
          <h3 className="font-semibold text-danger">พื้นที่อันตราย</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleClearDemo}
            className="flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            ลบข้อมูลตัวอย่าง
          </button>
        </div>
      </div>
    </div>
  );
}
