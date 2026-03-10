"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserPlan, setUserPlan, getClients, getTransactions } from "@/lib/store";
import { PLAN_LIMITS, PlanType } from "@/lib/types";

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>("free");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const userPlan = getUserPlan();
    // Check if plan expired
    if (userPlan.expiresAt && new Date(userPlan.expiresAt) < new Date()) {
      setUserPlan("free");
      setPlan("free");
    } else {
      setPlan(userPlan.plan);
    }
    setMounted(true);
  }, []);

  const limits = PLAN_LIMITS[plan];
  const isPro = plan === "pro" || plan === "pro_yearly";

  const upgrade = useCallback((newPlan: PlanType) => {
    setUserPlan(newPlan);
    setPlan(newPlan);
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

  return {
    plan,
    isPro,
    limits,
    mounted,
    upgrade,
    canAddClient,
    canAddTransaction,
    clientsRemaining,
    transactionsRemaining,
    planLabel: plan === "free" ? "แพลนฟรี" : plan === "pro" ? "แพลนโปร" : "แพลนโปรรายปี",
  };
}
