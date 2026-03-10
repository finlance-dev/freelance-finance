"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: "", message: "" },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState({ open: false, options: { title: "", message: "" }, resolve: null });
  };

  const variantColors = {
    danger: "bg-danger hover:bg-danger/90",
    warning: "bg-warning hover:bg-warning/90",
    primary: "bg-primary hover:bg-primary-dark",
  };

  const variant = state.options.variant || "danger";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                variant === "danger" ? "bg-danger/10" : variant === "warning" ? "bg-warning/10" : "bg-primary/10"
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  variant === "danger" ? "text-danger" : variant === "warning" ? "text-warning" : "text-primary"
                }`} />
              </div>
              <h3 className="font-bold text-lg">{state.options.title}</h3>
            </div>
            <p className="text-sm text-muted mb-5 ml-[52px]">{state.options.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-border transition"
              >
                {state.options.cancelText || "ยกเลิก"}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition ${variantColors[variant]}`}
              >
                {state.options.confirmText || "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
