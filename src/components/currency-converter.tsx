"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/types";
import { useLocale } from "@/hooks/useLocale";

interface ExchangeRates {
  [key: string]: number;
}

export function CurrencyConverter() {
  const { t } = useLocale();
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState("THB");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      // Use cached rates from localStorage if less than 1 hour old
      const cached = localStorage.getItem("ff_exchange_rates");
      if (cached) {
        const { rates: cachedRates, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) {
          setRates(cachedRates);
          setLastUpdated(new Date(timestamp).toLocaleTimeString());
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/THB`);
      if (res.ok) {
        const data = await res.json();
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString());
        localStorage.setItem("ff_exchange_rates", JSON.stringify({
          rates: data.rates,
          timestamp: Date.now(),
        }));
      }
    } catch {
      // Use fallback rates if API fails
      setRates({
        THB: 1, USD: 0.029, EUR: 0.027, GBP: 0.023,
        JPY: 4.35, CNY: 0.21, KRW: 40.5, SGD: 0.039, MYR: 0.13,
      });
      setLastUpdated(t("dashboard", "fallbackRates"));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = () => {
    if (!rates) return 0;
    const inTHB = from === "THB" ? amount : amount / (rates[from] || 1);
    return inTHB * (rates[to] || 1);
  };

  const converted = convert();

  const popularRates = [
    { code: "USD", label: "USD" },
    { code: "EUR", label: "EUR" },
    { code: "JPY", label: "JPY" },
    { code: "GBP", label: "GBP" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{t("dashboard", "currencyConverter")}</h3>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-secondary transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>

        <div className="text-center text-muted text-xs">↓</div>

        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-xl border border-border bg-secondary text-sm font-semibold">
            {rates ? converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "..."}
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick rates */}
      {rates && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted mb-2">1 THB =</p>
          <div className="grid grid-cols-2 gap-1.5">
            {popularRates.map((r) => (
              <div key={r.code} className="flex justify-between text-xs px-2 py-1 rounded-lg bg-secondary">
                <span className="text-muted">{r.label}</span>
                <span className="font-medium">{(rates[r.code] || 0).toFixed(4)}</span>
              </div>
            ))}
          </div>
          {lastUpdated && (
            <p className="text-[10px] text-muted mt-2 text-right">{t("dashboard", "ratesUpdated")}: {lastUpdated}</p>
          )}
        </div>
      )}
    </div>
  );
}
