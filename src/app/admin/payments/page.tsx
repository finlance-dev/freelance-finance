"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Image, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentOrder {
  id: string;
  user_email: string;
  user_name: string;
  plan: string;
  amount: number;
  status: string;
  slip_url: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [slipModal, setSlipModal] = useState<string | null>(null);

  const getPassword = () => sessionStorage.getItem("ff_admin_password") || "";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/approve?status=${filter}`, {
        headers: { "x-admin-password": getPassword() },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleAction = async (orderId: string, action: "approve" | "reject") => {
    setProcessing(orderId);
    try {
      const res = await fetch("/api/payment/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getPassword(),
        },
        body: JSON.stringify({ orderId, action }),
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch {
      // ignore
    }
    setProcessing(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Orders</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {(["pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition",
              filter === f ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            {f === "pending" && <Clock className="w-3.5 h-3.5 inline mr-1.5" />}
            {f === "approved" && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-accent" />}
            {f === "rejected" && <XCircle className="w-3.5 h-3.5 inline mr-1.5 text-danger" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No {filter} orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">{order.user_name || order.user_email}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      order.plan === "pro" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                    )}>
                      {order.plan === "pro" ? "Pro Monthly" : "Pro Yearly"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{order.user_email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-primary">฿{order.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted">{formatDate(order.created_at)}</span>
                  </div>
                </div>

                {/* Slip + Actions */}
                <div className="flex items-center gap-2">
                  {order.slip_url ? (
                    <button
                      onClick={() => setSlipModal(order.slip_url)}
                      className="flex items-center gap-1.5 text-xs bg-secondary hover:bg-border px-3 py-1.5 rounded-lg transition"
                    >
                      <Image className="w-3.5 h-3.5" />
                      ดูสลิป
                    </button>
                  ) : (
                    <span className="text-xs text-muted">ยังไม่ส่งสลิป</span>
                  )}

                  {filter === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, "approve")}
                        disabled={processing === order.id}
                        className="flex items-center gap-1.5 text-xs bg-accent hover:bg-accent/80 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(order.id, "reject")}
                        disabled={processing === order.id}
                        className="flex items-center gap-1.5 text-xs bg-danger hover:bg-danger/80 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slip preview modal */}
      {slipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSlipModal(null)}>
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={slipModal} alt="Payment slip" className="w-full rounded-xl" />
            <div className="flex justify-center mt-3 gap-2">
              <a
                href={slipModal}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-card text-foreground px-4 py-2 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                เปิดในแท็บใหม่
              </a>
              <button
                onClick={() => setSlipModal(null)}
                className="text-xs bg-card text-foreground px-4 py-2 rounded-lg"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
