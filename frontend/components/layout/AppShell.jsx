"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ role, children }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
