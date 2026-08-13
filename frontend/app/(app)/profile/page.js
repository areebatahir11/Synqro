"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS } from "@/constants/roles";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user.full_name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName === user.full_name) return;
    setIsSaving(true);
    try {
      await usersService.updateMe({ full_name: fullName.trim() });
      await refresh();
      toast({ title: "Profile updated", variant: "success" });
    } catch (err) {
      toast({ title: "Couldn't update profile", description: err.message, variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile" description="Manage your own account details." />
      <div className="max-w-lg px-6 py-6">
        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={user.full_name} size="lg" />
              <div>
                <p className="font-display text-base font-semibold text-ink">{user.full_name}</p>
                <p className="eyebrow">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Email" value={user.email} disabled />
              <Button type="submit" isLoading={isSaving} disabled={fullName === user.full_name || !fullName.trim()}>
                Save changes
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
