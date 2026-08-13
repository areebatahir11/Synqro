"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default" }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((current) => [...current, { id, title, description, variant }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={cn(
                "flex items-start gap-2.5 rounded-md border bg-white p-3 shadow-popover",
                t.variant === "success" && "border-success-bg",
                t.variant === "error" && "border-danger-bg",
                t.variant === "default" && "border-border"
              )}
            >
              {t.variant === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
              {t.variant === "error" && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.description && <p className="text-xs text-ink-muted">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-ink-faint hover:text-ink">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
