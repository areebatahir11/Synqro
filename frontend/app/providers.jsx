"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/hooks/use-toast";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
