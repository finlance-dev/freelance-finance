"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, description, compact = false }: UpgradePromptProps) {
  if (compact) {
    return (
      <Link
        href="/dashboard/pricing"
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Lock className="w-3.5 h-3.5" />
        อัปเกรดเป็นโปรเพื่อใช้{feature}
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2">{feature}</h3>
      <p className="text-muted text-sm mb-6 max-w-md mx-auto">
        {description || `ฟีเจอร์นี้สำหรับแพลนโปรเท่านั้น อัปเกรดเพื่อปลดล็อค${feature}และฟีเจอร์อื่นๆ อีกมากมาย`}
      </p>
      <Link
        href="/dashboard/pricing"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition"
      >
        <Sparkles className="w-4 h-4" />
        อัปเกรดเป็นโปร
      </Link>
    </div>
  );
}

export function UpgradeBanner({ clientsRemaining }: { clientsRemaining: number }) {
  if (clientsRemaining > 1) return null;

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Lock className="w-4 h-4 text-warning flex-shrink-0" />
        <span>
          {clientsRemaining === 0
            ? "ถึงขีดจำกัดลูกค้าแล้ว (3/3)"
            : `เหลืออีก ${clientsRemaining} ลูกค้า (แพลนฟรี จำกัด 3 ราย)`}
        </span>
      </div>
      <Link
        href="/dashboard/pricing"
        className="text-sm text-primary hover:underline font-medium whitespace-nowrap"
      >
        อัปเกรด
      </Link>
    </div>
  );
}
