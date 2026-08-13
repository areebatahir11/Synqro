"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { projectsService } from "@/services/projects.service";
import { useToast } from "@/hooks/use-toast";

export function AddMemberDialog({ open, onClose, onAdded, projectId, candidates }) {
  const { toast } = useToast();
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!memberId) {
      setError("Choose a team member.");
      return;
    }
    setIsSubmitting(true);
    try {
      const membership = await projectsService.addMember(projectId, memberId);
      toast({ title: "Member added", variant: "success" });
      onAdded?.(membership);
      onClose();
      setMemberId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add team member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Team member" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">Choose a team member…</option>
          {candidates?.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </Select>
        {candidates?.length === 0 && (
          <p className="text-xs text-ink-faint">Every team member is already on this project.</p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Add member</Button>
        </div>
      </form>
    </Dialog>
  );
}
