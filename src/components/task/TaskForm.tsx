"use client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, CirclePlus, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TaskForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  // **Fetch projects**
  useEffect(() => {
    async function fetchProjects() {
      try {
        if (!session?.user?.email) return;
        const res = await fetch(`/api/projects?email=${session.user.email}`);

        const projectData = await res.json();
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchProjects();
  }, [session]);

  // **Fetch project members when project is selected**
  useEffect(() => {
    async function fetchProjectMembers() {
      if (!selectedProject) return;

      try {
        const res = await fetch(`/api/projects/${selectedProject}`);
        const projectData = await res.json();

        if (projectData.members.length > 0) {
          setProjectMembers(projectData.members);
          setAssignedTo([]); // Reset selected members
        } else {
          // If no members, assign owner by default
          setProjectMembers([]);
          setAssignedTo([session?.user?.email ?? ""]);
        }
      } catch (error) {
        console.error("Error fetching project members:", error);
      }
    }
    fetchProjectMembers();
  }, [selectedProject, session]);

  const toggleAssignee = (email: string) => {
    setAssignedTo((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setStatus("todo");
    setPriority("medium");
    setAssignedTo([]);
    setSelectedProject("");
    setProjectMembers([]);
    setDueDate(undefined);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Task title is required!");
      return;
    }
    if (!selectedProject) {
      toast.error("Please select a project before creating a task.");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        category: category.trim() || "general",
        createdBy: session?.user?.email,
        project: selectedProject,
        assignedTo,
        dueDate,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        toast.success("Task created successfully!");
        resetForm();
        setOpen(false);
        onTaskAdded();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create task");
      }
    } catch (error: any) {
      toast.error(`Failed to create task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus size={18} />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-max">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CirclePlus className="text-blue-500" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Top section - Title and Description */}
          <div className="space-y-2">
            <label>Task Title</label>
            <Input placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label>Description</label>
            <Textarea 
              placeholder="Enter task details..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          {/* Middle section - 2-column grid */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Left column */}
            <div className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-2">
                <label>Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category input */}
              <div className="space-y-2">
                <label>Category</label>
                <Input
                  placeholder="Type category or select existing"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      className={`cursor-pointer ${category === cat ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Due Date Selection */}
              <div className="space-y-2">
                <label>Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-gray-300 ${!dueDate && "text-gray-500"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label>Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assign To Members */}
              {selectedProject && (
                <div className="space-y-2">
                  <label>Assign To</label>
                  <div className="border rounded-md p-2 space-y-1 h-32 overflow-auto">
                    {projectMembers.length > 0 ? (
                      projectMembers.map((member) => (
                        <div
                          key={member}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                            assignedTo.includes(member) ? "bg-blue-100" : "hover:bg-gray-100"
                          }`}
                          onClick={() => toggleAssignee(member)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member}`} />
                            <AvatarFallback>
                              <User size={14} />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">{member}</span>
                          {assignedTo.includes(member) && (
                            <Badge variant="outline" className="ml-auto bg-blue-500 text-white">
                              Selected
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No team members found.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}