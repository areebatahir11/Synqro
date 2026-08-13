"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PRIORITIES } from "@/constants/priorities";
import { tasksService } from "@/services/tasks.service";
import { useToast } from "@/hooks/use-toast";

export function CreateTaskDialog({ open, onClose, onCreated, projectId, members }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "", priority: "medium", due_date: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      };
      const task = await tasksService.create(projectId, payload);
      toast({ title: "Task created", variant: "success" });
      onCreated?.(task);
      onClose();
      setForm({ title: "", description: "", assigned_to: "", priority: "medium", due_date: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Task title" value={form.title} onChange={update("title")} placeholder="Fix login redirect bug" required />
        <Textarea label="Description" value={form.description} onChange={update("description")} placeholder="What needs to be done?" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Assignee" value={form.assigned_to} onChange={update("assigned_to")}>
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </Select>
          <Select label="Priority" value={form.priority} onChange={update("priority")}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        <Input label="Due date" type="date" value={form.due_date} onChange={update("due_date")} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create task</Button>
        </div>
      </form>
    </Dialog>
  );
}
