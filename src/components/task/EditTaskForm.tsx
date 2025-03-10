"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Task } from "@/lib/interfaces/task";

export default function EditTaskForm({ task, onClose, onUpdated }: { task: Task; onClose: () => void; onUpdated: () => void }) {
  const [title, setTitle] = useState(task.title.toString());
  const [category, setCategory] = useState(task.category.toString());
  const [status, setStatus] = useState(task.status.toString());
  const [priority, setPriority] = useState(task.priority.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error("Task title is required!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, status, priority }),
      });

      if (res.ok) {
        toast.success("Task updated successfully!");
        onUpdated();
        onClose();
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      toast.error("Failed to update task. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="text-xl">Edit Task</DialogTitle>

        <Input placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <div className="space-y-2 mt-2">
          <span className="text-sm font-medium">Category</span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{category}</Badge>
          </div>
          <Input placeholder="Enter category name" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Priority</span>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
