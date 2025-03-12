"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Edit2, Trash2, Save, Loader2, User } from "lucide-react";

export default function TaskDetailsPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();

    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [avatars, setAvatars] = useState<{ [email: string]: string }>({});

    useEffect(() => {
        fetchTask();
    }, [id]);

    /** Fetch Task Details */
    async function fetchTask() {
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks/${id}`);
            if (!res.ok) throw new Error("Failed to fetch task");
            const data = await res.json();
            setTask(data);
            setFormData(data);
            fetchAvatars(data.assignedTo);
        } catch (error) {
            toast.error("Error loading task details");
        } finally {
            setLoading(false);
        }
    }

    /** Fetch Avatars */
    async function fetchAvatars(emails: string[]) {
        const avatarPromises = emails.map(async (email) => {
            try {
                const res = await fetch(`/api/user/avatar?email=${email}`);
                const data = await res.json();
                return { email, avatar: res.ok ? data.avatar : "/default-avatar.png" };
            } catch {
                return { email, avatar: "/default-avatar.png" };
            }
        });

        const results = await Promise.all(avatarPromises);
        const avatarMap = results.reduce((acc, { email, avatar }) => {
            acc[email] = avatar;
            return acc;
        }, {} as { [email: string]: string });

        setAvatars(avatarMap);
    }

    /** Handle Task Update */
    async function updateTask() {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update task");
            toast.success("Task updated successfully!");
            setEditing(false);
            fetchTask();
        } catch (error) {
            toast.error("Error updating task");
        }
    }

    /** Handle Task Delete */
    async function deleteTask() {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete task");

            toast.success("Task deleted!");
            router.push("/dashboard/tasks");
        } catch (error) {
            toast.error("Error deleting task");
        }
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!task) return <div className="text-center p-10">Task not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Task Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditing(true)}><Edit2 size={16} /> Edit</Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive"><Trash2 size={16} /> Delete</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Task</DialogTitle>
                                <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive" onClick={deleteTask}>Yes, Delete</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <hr></hr>

            {/* Task Details */}
            <div className="grid gap-4 bg-white p-6 ">
                <p className="text-gray-700">{task.description}</p>

                <div className="flex items-center gap-2">
                    <Badge>{task.status}</Badge>
                    <Badge variant={task.priority === "high" ? "destructive" : "default"}>{task.priority}</Badge>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Calendar size={16} />
                        <span>Due {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</span>
                    </div>
                </div>

                {/* Assigned Users */}
                <div className="flex items-center gap-2">
                    <h3 className="font-medium">Assigned To:</h3>
                    <div className="flex flex-wrap gap-2">
                        {task.assignedTo.map((email: string) => (
                            <div key={email} className="flex items-center gap-2 p-2 border ">
                                <Avatar className="w-8 h-8 border">
                                    <AvatarImage src={avatars[email] || "/default-avatar.png"} />
                                    <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-700">{email}</span>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Attachments */}
                {task.attachments.length > 0 && (
                    <div>
                        <h3 className="font-medium">Attachments:</h3>
                        <ul className="list-disc list-inside">
                            {task.attachments.map((file: string, index: number) => (
                                <li key={index}><a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-500">{file}</a></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Edit Task Dialog */}
            {editing && (
                <Dialog open={editing} onOpenChange={setEditing}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                            <Button onClick={updateTask}><Save size={16} /> Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
