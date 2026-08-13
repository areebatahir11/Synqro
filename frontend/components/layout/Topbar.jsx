"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PulseDot } from "@/components/ui/PulseDot";
import { useAuth } from "@/context/AuthContext";
import { notificationsService } from "@/services/notifications.service";

export function Topbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    notificationsService
      .list({ is_read: false })
      .then((data) => {
        if (!cancelled) setUnreadCount(data.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-white px-6">
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative rounded-md p-2 text-ink-muted hover:bg-canvas hover:text-ink">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <PulseDot className="absolute right-1.5 top-1.5" />
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-canvas"
          >
            <Avatar name={user?.full_name} size="sm" />
            <span className="text-sm font-medium text-ink">{user?.full_name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-white py-1 shadow-popover">
              <Link
                href="/profile"
                className="block px-3 py-2 text-sm text-ink hover:bg-canvas"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-bg"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
