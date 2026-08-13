"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";

export function CreateUserDialog({ open, onClose, onCreated }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: ROLES.TEAM_MEMBER });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 8) {
      setError("Fill in all fields — password needs at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await usersService.create(form);
      toast({ title: "User created", variant: "success" });
      onCreated?.(user);
      onClose();
      setForm({ full_name: "", email: "", password: "", role: ROLES.TEAM_MEMBER });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create user">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" value={form.full_name} onChange={update("full_name")} placeholder="Areeba Tahir" required />
        <Input label="Email" type="email" value={form.email} onChange={update("email")} placeholder="name@company.com" required />
        <Input label="Temporary password" type="password" value={form.password} onChange={update("password")} placeholder="At least 8 characters" required />
        <Select label="Role" value={form.role} onChange={update("role")}>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </Select>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create user</Button>
        </div>
      </form>
    </Dialog>
  );
}
