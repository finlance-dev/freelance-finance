"use client";

import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "finlance2026";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("ff_admin_auth");
    if (stored === "true") setIsAdmin(true);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("ff_admin_auth", "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("ff_admin_auth");
    setIsAdmin(false);
  };

  return { isAdmin, mounted, login, logout };
}
