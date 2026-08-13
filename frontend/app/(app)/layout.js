"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoading } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <PageLoading />
      </div>
    );
  }

  return <AppShell role={user.role}>{children}</AppShell>;
}
