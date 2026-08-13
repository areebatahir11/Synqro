"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PulseDot } from "@/components/ui/PulseDot";
import { notificationsService } from "@/services/notifications.service";
import { formatRelative } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATION_LINK = (n) => (n.related_task_id ? `/tasks/${n.related_task_id}` : "#");

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    notificationsService.list().then(setNotifications).finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      toast({ title: "Couldn't update notification", description: err.message, variant: "error" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      toast({ title: "Couldn't update notifications", description: err.message, variant: "error" });
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <PageHeader
        eyebrow="Notifications"
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )
        }
      />
      <div className="px-6 py-6">
        {isLoading ? (
          <PageLoading />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="Task assignments, status changes, and messages will show up here." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={NOTIFICATION_LINK(n)}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className="flex items-start gap-3 border-b border-border px-5 py-3.5 last:border-b-0 hover:bg-canvas"
              >
                {!n.is_read && <PulseDot className="mt-1.5" />}
                <div className={`min-w-0 flex-1 ${n.is_read ? "pl-5" : ""}`}>
                  <p className={`text-sm ${n.is_read ? "text-ink-muted" : "font-medium text-ink"}`}>{n.message}</p>
                  <p className="eyebrow mt-0.5">{formatRelative(n.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
