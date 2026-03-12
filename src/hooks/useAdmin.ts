"use client";

import { useState, useEffect } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("ff_admin_auth");
    if (stored === "true") setIsAdmin(true);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    // Validate password against server
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      sessionStorage.setItem("ff_admin_auth", "true");
      sessionStorage.setItem("ff_admin_password", password);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("ff_admin_auth");
    sessionStorage.removeItem("ff_admin_password");
    setIsAdmin(false);
  };

  return { isAdmin, mounted, login, logout };
}
