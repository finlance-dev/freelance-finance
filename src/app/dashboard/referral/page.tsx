"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Gift, Users, Wallet, ArrowUpRight, Banknote, Clock, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

interface ReferralStats {
  totalReferred: number;
  totalConverted: number;
  totalEarned: number;
  pendingAmount: number;
  paidAmount: number;
  availableToWithdraw: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  promptpay_id: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [commissionRate, setCommissionRate] = useState(0.25);
  const [copied, setCopied] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [promptpayId, setPromptpayId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`/api/referral?userId=${user.id}`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        setCode(data.code || "");
        setStats(data.stats);
        setWithdrawals(data.withdrawals || []);
        setCommissionRate(data.commissionRate || 0.25);
      }
    } catch {
      // timeout or network error
    }
    setLoading(false);
  };

  const copyLink = () => {
    const link = `https://finlance.co/signup?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast("คัดลอกลิงก์แล้ว!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 500) {
      toast("ยอดถอนขั้นต่ำ ฿500", "error");
      return;
    }
    if (!promptpayId.trim()) {
      toast("กรุณากรอก PromptPay ID", "error");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount, promptpayId: promptpayId.trim() }),
      });

      if (res.ok) {
        toast("ส่งคำขอถอนเงินแล้ว!", "success");
        setShowWithdraw(false);
        setWithdrawAmount("");
        loadData();
      } else {
        const err = await res.json();
        toast(err.error || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      toast("เกิดข้อผิดพลาด", "error");
    }
    setSubmitting(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!code) {
    return (
      <div className="text-center py-16 text-muted">
        <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">กรุณาเข้าสู่ระบบ</p>
        <p className="text-sm mt-1">ต้อง login เพื่อใช้ระบบแนะนำเพื่อน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แนะนำเพื่อน</h1>
        <p className="text-muted text-sm mt-1">
          แชร์ลิงก์ให้เพื่อน เมื่อเพื่อนซื้อ Pro คุณได้ค่าคอม {commissionRate * 100}%
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-card border border-border rounded-xl p-5">
        <label className="text-xs text-muted font-medium">ลิงก์แนะนำของคุณ</label>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            readOnly
            value={`https://finlance.co/signup?ref=${code}`}
            className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm font-mono"
          />
          <button
            onClick={copyLink}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition",
              copied ? "bg-accent text-white" : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          รหัสแนะนำ: <span className="font-mono font-bold text-foreground">{code}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats?.totalReferred || 0}</p>
          <p className="text-xs text-muted">คนที่แนะนำ</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <ArrowUpRight className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold">{stats?.totalConverted || 0}</p>
          <p className="text-xs text-muted">ซื้อ Pro แล้ว</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <Wallet className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold">฿{(stats?.totalEarned || 0).toLocaleString()}</p>
          <p className="text-xs text-muted">รายได้ทั้งหมด</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <Banknote className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold">฿{(stats?.availableToWithdraw || 0).toLocaleString()}</p>
          <p className="text-xs text-muted">ถอนได้</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-3">วิธีการทำงาน</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
            <p className="text-muted">แชร์ลิงก์แนะนำให้เพื่อน</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
            <p className="text-muted">เพื่อนสมัครผ่านลิงก์ + อัพเกรดเป็น Pro</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
            <p className="text-muted">คุณได้ค่าคอม {commissionRate * 100}% ของยอดที่เพื่อนจ่าย (Pro Monthly = ฿{Math.round(299 * commissionRate)}, Pro Yearly = ฿{Math.round(2499 * commissionRate)})</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
            <p className="text-muted">ถอนเงินผ่าน PromptPay เมื่อยอดสะสมครบ ฿500</p>
          </div>
        </div>
      </div>

      {/* Withdraw Button — always visible */}
      <button
        onClick={() => (stats?.availableToWithdraw || 0) >= 500 ? setShowWithdraw(true) : null}
        disabled={(stats?.availableToWithdraw || 0) < 500}
        className={cn(
          "w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2",
          (stats?.availableToWithdraw || 0) >= 500
            ? "bg-accent text-white hover:bg-accent/90"
            : "bg-secondary text-muted cursor-not-allowed"
        )}
      >
        <Banknote className="w-5 h-5" />
        {(stats?.availableToWithdraw || 0) >= 500
          ? `ถอนเงิน ฿${(stats?.availableToWithdraw || 0).toLocaleString()}`
          : `ถอนเงินได้เมื่อยอดครบ ฿500 (ตอนนี้ ฿${(stats?.availableToWithdraw || 0).toLocaleString()})`
        }
      </button>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowWithdraw(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">ถอนค่าคอม</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted">จำนวนเงิน (ขั้นต่ำ ฿500)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder={`สูงสุด ฿${(stats?.availableToWithdraw || 0).toLocaleString()}`}
                  className="w-full mt-1 bg-secondary rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">PromptPay ID (เบอร์โทร/บัตร ปชช.)</label>
                <input
                  type="text"
                  value={promptpayId}
                  onChange={e => setPromptpayId(e.target.value)}
                  placeholder="0812345678"
                  className="w-full mt-1 bg-secondary rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-2.5 text-sm rounded-lg bg-secondary hover:bg-border transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 transition disabled:opacity-50"
                >
                  {submitting ? "กำลังส่ง..." : "ยืนยันถอนเงิน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-3">ประวัติการถอน</h3>
          <div className="space-y-2">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">฿{w.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted">{formatDate(w.created_at)}</p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  w.status === "paid" && "bg-accent/10 text-accent",
                  w.status === "pending" && "bg-warning/10 text-warning",
                  w.status === "approved" && "bg-primary/10 text-primary",
                  w.status === "rejected" && "bg-danger/10 text-danger",
                )}>
                  {w.status === "paid" && <><CheckCircle2 className="w-3 h-3 inline mr-1" />โอนแล้ว</>}
                  {w.status === "pending" && <><Clock className="w-3 h-3 inline mr-1" />รอดำเนินการ</>}
                  {w.status === "approved" && <><CheckCircle2 className="w-3 h-3 inline mr-1" />อนุมัติแล้ว</>}
                  {w.status === "rejected" && <><XCircle className="w-3 h-3 inline mr-1" />ปฏิเสธ</>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
