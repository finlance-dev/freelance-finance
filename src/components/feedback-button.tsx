"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Mail } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { useToast } from "@/components/toast";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const { toast } = useToast();

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

  const handleSend = () => {
    if (!message.trim()) return;

    // Open mailto with pre-filled subject and body
    const subject = encodeURIComponent("Finlance Feedback");
    const body = encodeURIComponent(message.trim());
    window.open(`mailto:finlanceco@gmail.com?subject=${subject}&body=${body}`, "_blank");

    toast(t("feedback", "thankYou"), "success");
    setMessage("");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50" ref={ref}>
      {open && (
        <div className="absolute bottom-14 left-0 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">{t("feedback", "title")}</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted">{t("feedback", "description")}</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("feedback", "placeholder")}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
            />
            <div className="flex items-center justify-between">
              <a
                href="mailto:finlanceco@gmail.com"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition"
              >
                <Mail className="w-3.5 h-3.5" />
                finlanceco@gmail.com
              </a>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                {t("feedback", "send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
        title={t("feedback", "title")}
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>
    </div>
  );
}
