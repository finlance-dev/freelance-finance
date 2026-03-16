"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Clock, Banknote, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  promptpay_id: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
}

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "paid" | "rejected">("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  const getPassword = () => sessionStorage.getItem("ff_admin_password") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals?status=${filter}`, {
        headers: { "x-admin-password": getPassword() },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.withdrawals || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [filter, fetchData]);

  const handleAction = async (id: string, action: "approve" | "reject" | "paid") => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getPassword(),
        },
        body: JSON.stringify({ withdrawalId: id, action }),
      });
      if (res.ok) {
        setItems(prev => prev.filter(w => w.id !== id));
      }
    } catch { /* ignore */ }
    setProcessing(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">คำขอถอนค่าคอม</h1>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {(["pending", "approved", "paid", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition",
              filter === f ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            {f === "pending" && <Clock className="w-3.5 h-3.5 inline mr-1.5" />}
            {f === "approved" && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-primary" />}
            {f === "paid" && <Banknote className="w-3.5 h-3.5 inline mr-1.5 text-accent" />}
            {f === "rejected" && <XCircle className="w-3.5 h-3.5 inline mr-1.5 text-danger" />}
            {f === "pending" ? "รอดำเนินการ" : f === "approved" ? "อนุมัติแล้ว" : f === "paid" ? "โอนแล้ว" : "ปฏิเสธ"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <Banknote className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>ไม่มีรายการ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((w) => (
            <div key={w.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted font-mono truncate">User: {w.user_id}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-bold text-primary">฿{w.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted">PromptPay: {w.promptpay_id}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">{formatDate(w.created_at)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {filter === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(w.id, "approve")}
                        disabled={processing === w.id}
                        className="text-xs bg-primary hover:bg-primary/80 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleAction(w.id, "reject")}
                        disabled={processing === w.id}
                        className="text-xs bg-danger hover:bg-danger/80 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 inline mr-1" />
                        ปฏิเสธ
                      </button>
                    </>
                  )}
                  {filter === "approved" && (
                    <button
                      onClick={() => handleAction(w.id, "paid")}
                      disabled={processing === w.id}
                      className="text-xs bg-accent hover:bg-accent/80 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <Banknote className="w-3.5 h-3.5 inline mr-1" />
                      โอนแล้ว
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
