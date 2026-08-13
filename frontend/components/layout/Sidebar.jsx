"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ICON_MAP } from "@/components/layout/icon-map";
import { NAV_ITEMS } from "@/constants/nav";
import { ROLE_LABELS } from "@/constants/roles";
import { cn } from "@/lib/utils";

export function Sidebar({ role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-white">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <p className="eyebrow px-5 pb-2">{ROLE_LABELS[role]}</p>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-signal-50 text-signal-700"
                  : "text-ink-muted hover:bg-canvas hover:text-ink"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
