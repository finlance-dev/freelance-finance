"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Upload,
  Cloud,
  Globe,
  Shield,
  Trash2,
  QrCode,
  MessageCircle,
  Send,
  Languages,
  Mail,
  HeadphonesIcon,
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
  getLineNotifyToken,
  setLineNotifyToken as storeSetLineToken,
} from "@/lib/store";
import { isValidPromptPayId } from "@/lib/promptpay";
import { sendLineNotify } from "@/lib/line-notify";
import { SUPPORTED_CURRENCIES } from "@/lib/types";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm-dialog";
import { usePlan } from "@/hooks/usePlan";
import { useLocale } from "@/hooks/useLocale";
import { UpgradePrompt } from "@/components/upgrade-prompt";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState("THB");
  const [syncing, setSyncing] = useState(false);
  const [promptpayId, setPromptpayId] = useState("");
  const [promptpayError, setPromptpayError] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [lineTesting, setLineTesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { isPro } = usePlan();
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    setCurrency(getDefaultCurrency());
    setPromptpayId(getPromptPayId());
    setLineToken(getLineNotifyToken());
    setMounted(true);
  }, []);

  const handleSaveLineToken = () => {
    storeSetLineToken(lineToken.trim());
    toast(lineToken.trim()
      ? (locale === "th" ? "บันทึก Line Notify Token สำเร็จ" : "Line Notify Token saved")
      : (locale === "th" ? "ลบ Line Notify Token สำเร็จ" : "Line Notify Token removed"));
  };

  const handleTestLineNotify = async () => {
    setLineTesting(true);
    const ok = await sendLineNotify("\n✅ ทดสอบจาก Finlance\nระบบแจ้งเตือน Line ทำงานปกติ!");
    setLineTesting(false);
    toast(
      ok
        ? (locale === "th" ? "ส่งข้อความทดสอบสำเร็จ ตรวจสอบ Line ของคุณ" : "Test message sent! Check your Line.")
        : (locale === "th" ? "ส่งไม่สำเร็จ ตรวจสอบ Token อีกครั้ง" : "Send failed. Check your Token."),
      ok ? "success" : "error"
    );
  };

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freelanceflow-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(locale === "th" ? "ส่งออกข้อมูลสำเร็จ" : "Data exported successfully");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const ok = await confirm({
        title: t("settings", "importConfirmTitle"),
        message: t("settings", "importConfirmMsg"),
        confirmText: t("settings", "import"),
        variant: "warning",
      });
      if (!ok) return;

      const result = importAllData(text);
      if (result.success) {
        toast(locale === "th" ? "นำเข้าข้อมูลสำเร็จ รีเฟรชหน้าเพื่อดูข้อมูลใหม่" : "Data imported. Refreshing...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast(result.error || (locale === "th" ? "นำเข้าไม่สำเร็จ" : "Import failed"), "error");
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
      toast(locale === "th" ? "ซิงค์ข้อมูลจากคลาวด์สำเร็จ" : "Synced from cloud");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast(locale === "th" ? "ซิงค์ไม่สำเร็จ ตรวจสอบการเชื่อมต่อ Supabase" : "Sync failed. Check Supabase connection.", "error");
    }
  };

  const handleSavePromptPay = () => {
    const clean = promptpayId.replace(/[-\s]/g, "");
    if (clean && !isValidPromptPayId(clean)) {
      setPromptpayError(t("settings", "promptpayError"));
      return;
    }
    setPromptpayError("");
    storeSetPromptPayId(clean);
    toast(clean
      ? (locale === "th" ? "บันทึก PromptPay ID สำเร็จ" : "PromptPay ID saved")
      : (locale === "th" ? "ลบ PromptPay ID สำเร็จ" : "PromptPay ID removed"));
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    setDefaultCurrency(code);
    toast(locale === "th" ? `เปลี่ยนสกุลเงินเป็น ${code}` : `Currency changed to ${code}`);
  };

  const handleClearDemo = async () => {
    const ok = await confirm({
      title: t("settings", "clearDemoTitle"),
      message: t("settings", "clearDemoMsg"),
      confirmText: t("common", "delete"),
      variant: "danger",
    });
    if (!ok) return;
    clearDemoData();
    toast(locale === "th" ? "ลบข้อมูลตัวอย่างสำเร็จ" : "Demo data cleared");
    setTimeout(() => window.location.reload(), 1000);
  };

  if (!mounted) return null;

  const cloud = isCloudEnabled();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("settings", "title")}</h1>
        <p className="text-muted text-sm mt-1">{t("settings", "subtitle")}</p>
      </div>

      {/* Language */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Languages className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t("settings", "language")}</h3>
        </div>
        <p className="text-sm text-muted mb-3">{t("settings", "languageDesc")}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale("th")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
              locale === "th"
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted border-border hover:text-foreground"
            }`}
          >
            {t("settings", "thai")}
          </button>
          <button
            onClick={() => setLocale("en")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
              locale === "en"
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted border-border hover:text-foreground"
            }`}
          >
            {t("settings", "english")}
          </button>
        </div>
      </div>

      {/* Cloud Status */}
      {cloud && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">{t("settings", "cloudTitle")}</h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-accent">{t("settings", "cloudConnected")}</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-sm bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              {syncing ? t("settings", "syncing") : t("settings", "syncFromCloud")}
            </button>
          </div>
        </div>
      )}

      {/* Default Currency */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t("settings", "currencyTitle")}</h3>
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
        <p className="text-xs text-muted mt-2">{t("settings", "currencyDesc")}</p>
      </div>

      {/* PromptPay */}
      {isPro ? (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t("settings", "promptpayTitle")}</h3>
          </div>
          <p className="text-sm text-muted mb-3">{t("settings", "promptpayDesc")}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptpayId}
              onChange={(e) => { setPromptpayId(e.target.value); setPromptpayError(""); }}
              placeholder={t("settings", "promptpayPlaceholder")}
              className={`flex-1 px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm ${promptpayError ? "border-danger" : "border-border"}`}
            />
            <button
              onClick={handleSavePromptPay}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition"
            >
              {t("common", "save")}
            </button>
          </div>
          {promptpayError && <p className="text-danger text-xs mt-1.5">{promptpayError}</p>}
          {!promptpayError && promptpayId && isValidPromptPayId(promptpayId) && (
            <p className="text-accent text-xs mt-1.5">{t("settings", "promptpayActive")}</p>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t("settings", "promptpayTitle")}</h3>
          </div>
          <UpgradePrompt feature="PromptPay QR" description={t("settings", "promptpayDesc")} />
        </div>
      )}

      {/* Line Notify */}
      {isPro ? (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">{t("settings", "lineTitle")}</h3>
          </div>
          <p className="text-sm text-muted mb-3">{t("settings", "lineDesc")}</p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={lineToken}
              onChange={(e) => setLineToken(e.target.value)}
              placeholder={t("settings", "linePlaceholder")}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
            />
            <button
              onClick={handleSaveLineToken}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition"
            >
              {t("common", "save")}
            </button>
          </div>
          {lineToken && (
            <button
              onClick={handleTestLineNotify}
              disabled={lineTesting}
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {lineTesting ? t("settings", "lineTesting") : t("settings", "lineTest")}
            </button>
          )}
          <p className="text-xs text-muted mt-2">
            {t("settings", "lineHelp")}{" "}
            <a href="https://notify-bot.line.me/my/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              notify-bot.line.me
            </a>
            {" "}{t("settings", "lineHelpSuffix")}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">{t("settings", "lineTitle")}</h3>
          </div>
          <UpgradePrompt feature="Line Notify" description={t("settings", "lineDesc")} />
        </div>
      )}

      {/* Backup & Restore */}
      {isPro ? (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">{t("settings", "backupTitle")}</h3>
          </div>
          <p className="text-sm text-muted mb-4">{t("settings", "backupDesc")}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-accent/10 text-accent hover:bg-accent/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Download className="w-4 h-4" />
              {t("settings", "export")}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Upload className="w-4 h-4" />
              {t("settings", "import")}
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
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">{t("settings", "backupTitle")}</h3>
          </div>
          <UpgradePrompt feature={t("settings", "backupTitle")} description={t("settings", "backupDesc")} />
        </div>
      )}

      {/* Contact Us */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <HeadphonesIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t("settings", "contactTitle")}</h3>
        </div>
        <p className="text-sm text-muted mb-4">{t("settings", "contactDesc")}</p>
        <a
          href="mailto:finlanceco@gmail.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-medium transition"
        >
          <Mail className="w-4 h-4" />
          finlanceco@gmail.com
        </a>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-danger/30 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Trash2 className="w-5 h-5 text-danger" />
          <h3 className="font-semibold text-danger">{t("settings", "dangerZone")}</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleClearDemo}
            className="flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/20 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            {t("settings", "clearDemo")}
          </button>
        </div>
      </div>
    </div>
  );
}
