"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { CreateUserDialog } from "@/components/domain/CreateUserDialog";
import { usersService } from "@/services/users.service";
import { useAuth } from "@/context/AuthContext";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadUsers = () => {
    setIsLoading(true);
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    usersService.list(params).then(setUsers).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadUsers, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleDelete = async (u) => {
    if (u.id === currentUser.id) return;
    if (!confirm(`Remove ${u.full_name}? They'll lose access immediately.`)) return;
    try {
      await usersService.remove(u.id);
      toast({ title: "User removed", variant: "success" });
      loadUsers();
    } catch (err) {
      toast({ title: "Couldn't remove user", description: err.message, variant: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Users"
        title="Users"
        description="Create accounts and manage roles."
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New user</Button>}
      />
      <div className="px-6 py-6">
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input placeholder="Search users…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
        </div>

        {isLoading ? (
          <PageLoading />
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or create a new user." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0">
                <Avatar name={u.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{u.full_name}</p>
                  <p className="truncate text-xs text-ink-muted">{u.email}</p>
                </div>
                <span className="eyebrow">{ROLE_LABELS[u.role]}</span>
                <button
                  onClick={() => handleDelete(u)}
                  disabled={u.id === currentUser.id}
                  className="rounded-md p-1.5 text-ink-faint hover:bg-danger-bg hover:text-danger disabled:pointer-events-none disabled:opacity-30"
                  title={u.id === currentUser.id ? "You can't remove yourself" : "Remove user"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateUserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={loadUsers} />
    </div>
  );
}
