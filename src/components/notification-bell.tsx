"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Check, CheckCheck, AlertTriangle, AlertCircle, Info, FileText, TrendingDown, Target, Calculator, CreditCard } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  checkAndGenerateNotifications,
} from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";
import { useRouter } from "next/navigation";

const priorityStyles = {
  critical: "border-l-danger bg-danger/5",
  warning: "border-l-warning bg-warning/5",
  info: "border-l-primary bg-primary/5",
};

const typeIcons = {
  invoice_overdue: FileText,
  low_runway: TrendingDown,
  tax_deadline: Calculator,
  income_goal_reached: Target,
  invoice_paid: FileText,
  plan_expiring: CreditCard,
  plan_expired: CreditCard,
  system: Info,
};

const priorityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLocale();

  const refresh = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  useEffect(() => {
    // Generate notifications on mount
    checkAndGenerateNotifications();
    refresh();

    // Re-check every 5 minutes
    const interval = setInterval(() => {
      checkAndGenerateNotifications();
      refresh();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refresh]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    refresh();
    if (notif.actionUrl) {
      setOpen(false);
      router.push(notif.actionUrl);
    }
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dismissNotification(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    refresh();
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("notifications", "justNow");
    if (mins < 60) return `${mins} ${t("notifications", "minsAgo")}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${t("notifications", "hoursAgo")}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t("notifications", "daysAgo")}`;
  };

  const getTitle = (notif: AppNotification) => {
    try {
      let text = t("notifications", notif.titleKey as never);
      if (notif.messageParams) {
        Object.entries(notif.messageParams).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    } catch {
      return notif.titleKey;
    }
  };

  const getMessage = (notif: AppNotification) => {
    try {
      let text = t("notifications", notif.messageKey as never);
      if (notif.messageParams) {
        Object.entries(notif.messageParams).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    } catch {
      return notif.messageKey;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-secondary transition"
        title={t("notifications", "title")}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">{t("notifications", "title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("notifications", "markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                {t("notifications", "empty")}
              </div>
            ) : (
              notifications.map((notif) => {
                const TypeIcon = typeIcons[notif.type] || Info;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`flex gap-3 px-4 py-3 border-l-3 border-b border-border cursor-pointer hover:bg-secondary/50 transition ${
                      priorityStyles[notif.priority]
                    } ${notif.read ? "opacity-60" : ""}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <TypeIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.read ? "" : "font-semibold"}`}>
                        {getTitle(notif)}
                      </p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">
                        {getMessage(notif)}
                      </p>
                      <p className="text-[11px] text-muted/60 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                      <button
                        onClick={(e) => handleDismiss(e, notif.id)}
                        className="p-0.5 text-muted/40 hover:text-muted transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
