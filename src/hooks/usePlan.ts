"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserPlan, setUserPlan, getClients, getTransactions, startTrialPlan, hasUsedTrial } from "@/lib/store";
import { PLAN_LIMITS, PlanType } from "@/lib/types";

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>("free");
  const [mounted, setMounted] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    const userPlan = getUserPlan();
    // Check if plan expired
    if (userPlan.expiresAt && new Date(userPlan.expiresAt) < new Date()) {
      setUserPlan("free");
      setPlan("free");
      setIsTrial(false);
      setTrialDaysLeft(0);
    } else {
      setPlan(userPlan.plan);
      // Check if this is a trial (pro with short expiry)
      if (userPlan.plan === "pro" && userPlan.expiresAt) {
        const activatedMs = new Date(userPlan.activatedAt).getTime();
        const expiresMs = new Date(userPlan.expiresAt).getTime();
        const durationDays = (expiresMs - activatedMs) / (1000 * 60 * 60 * 24);
        if (durationDays <= 4) {
          setIsTrial(true);
          const daysLeft = Math.max(0, Math.ceil((expiresMs - Date.now()) / (1000 * 60 * 60 * 24)));
          setTrialDaysLeft(daysLeft);
        }
      }
    }
    setMounted(true);

    // Listen for plan changes from other components
    const handlePlanChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.plan) setPlan(detail.plan);
    };
    window.addEventListener("ff_plan_changed", handlePlanChange);
    return () => window.removeEventListener("ff_plan_changed", handlePlanChange);
  }, []);

  const limits = PLAN_LIMITS[plan];
  const isPro = plan === "pro" || plan === "pro_yearly";

  const upgrade = useCallback((newPlan: PlanType) => {
    setUserPlan(newPlan);
    setPlan(newPlan);
    setIsTrial(false);
    window.dispatchEvent(new CustomEvent("ff_plan_changed", { detail: { plan: newPlan } }));
  }, []);

  const startTrial = useCallback(() => {
    startTrialPlan();
    setPlan("pro");
    setIsTrial(true);
    setTrialDaysLeft(3);
    window.dispatchEvent(new CustomEvent("ff_plan_changed", { detail: { plan: "pro" } }));
  }, []);

  const canAddClient = useCallback(() => {
    const clients = getClients();
    return clients.length < limits.maxClients;
  }, [limits.maxClients]);

  const canAddTransaction = useCallback(() => {
    const transactions = getTransactions();
    return transactions.length < limits.maxTransactions;
  }, [limits.maxTransactions]);

  const clientsRemaining = useCallback(() => {
    const clients = getClients();
    const remaining = limits.maxClients - clients.length;
    return remaining === Infinity ? Infinity : Math.max(0, remaining);
  }, [limits.maxClients]);

  const transactionsRemaining = useCallback(() => {
    const transactions = getTransactions();
    const remaining = limits.maxTransactions - transactions.length;
    return remaining === Infinity ? Infinity : Math.max(0, remaining);
  }, [limits.maxTransactions]);

  const trialAvailable = !hasUsedTrial() && plan === "free";

  const planLabel = isTrial
    ? `ทดลองโปร (${trialDaysLeft} วัน)`
    : plan === "free"
    ? "แพลนฟรี"
    : plan === "pro"
    ? "แพลนโปร"
    : "แพลนโปรรายปี";

  return {
    plan,
    isPro,
    limits,
    mounted,
    upgrade,
    startTrial,
    isTrial,
    trialDaysLeft,
    trialAvailable,
    canAddClient,
    canAddTransaction,
    clientsRemaining,
    transactionsRemaining,
    planLabel,
  };
}
