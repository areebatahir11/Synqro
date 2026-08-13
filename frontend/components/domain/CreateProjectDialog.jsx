"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PRIORITIES } from "@/constants/priorities";
import { projectsService } from "@/services/projects.service";
import { useToast } from "@/hooks/use-toast";

export function CreateProjectDialog({ open, onClose, onCreated, projectManagers }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    priority: "medium",
    project_manager_id: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        project_manager_id: form.project_manager_id || null,
      };
      const project = await projectsService.create(payload);
      toast({ title: "Project created", variant: "success" });
      onCreated?.(project);
      onClose();
      setForm({ name: "", description: "", start_date: "", end_date: "", priority: "medium", project_manager_id: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Project name" value={form.name} onChange={update("name")} placeholder="Q3 Platform Migration" required />
        <Textarea label="Description" value={form.description} onChange={update("description")} placeholder="What's this project about?" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" value={form.start_date} onChange={update("start_date")} />
          <Input label="End date" type="date" value={form.end_date} onChange={update("end_date")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Priority" value={form.priority} onChange={update("priority")}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select label="Project manager" value={form.project_manager_id} onChange={update("project_manager_id")}>
            <option value="">Unassigned</option>
            {projectManagers?.map((pm) => (
              <option key={pm.id} value={pm.id}>{pm.full_name}</option>
            ))}
          </Select>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create project</Button>
        </div>
      </form>
    </Dialog>
  );
}
