'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
interface ProjectTasksProps {
    projectId: string;
    refresh: boolean;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, refresh, setRefresh }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [avatars, setAvatars] = useState<{ [email: string]: string }>({});

    useEffect(() => {
        async function getAllTasks() {
            if (!session?.user?.email) return;
            const res = await fetch('/api/tasks');
            const data = await res.json();
            const userTasks = data.filter((task: any) =>
                task.createdBy === session.user.email || task.assignedTo.includes(session.user.email)
            );
            setTasks(userTasks);
            if (userTasks.length === 0) {
                toast.info("No tasks found! You must be assigned or own tasks to view them.", { id: "no-tasks" });
            }
        }
        getAllTasks();
    }, [refresh, session]);
    useEffect(() => {
        async function fetchProjectTasks() {
            if (!session?.user?.email || !projectId) return;

            const res = await fetch(`/api/tasks?project=${projectId}`);
            const data = await res.json();
            setTasks(data);

            if (data.length === 0) {
                toast.info("No tasks found for this project.");
            }
        }
        fetchProjectTasks();
    }, [refresh, session, projectId]);

    useEffect(() => {
        async function fetchAvatars() {
            const uniqueEmails = [...new Set(tasks.flatMap(task => task.assignedTo))];
            const avatarPromises = uniqueEmails.map(async (email) => {
                try {
                    const res = await fetch(`/api/user/avatar?email=${email}`);
                    const data = await res.json();
                    return { email, avatar: res.ok ? data.avatar : "/default-avatar.png" };
                } catch (error) {
                    return { email, avatar: "/default-avatar.png" };
                }
            });
            const avatarResults = await Promise.all(avatarPromises);
            const avatarMap = avatarResults.reduce((acc, { email, avatar }) => {
                acc[email] = avatar;
                return acc;
            }, {} as { [email: string]: string });
            setAvatars(avatarMap);
        }

        if (tasks.length > 0) {
            fetchAvatars();
        }
    }, [tasks]);

    return (
        <div className="max-w-6xl  mt-6 mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Project Tasks</h2>
            
            <div className="mt-6 bg-white border rounded-lg shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.filter(task => task.project === projectId).map((task) => (
                            <TableRow key={task._id} onClick={() => router.push(`/dashboard/tasks/${task._id}`)}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell><Badge>{task.status}</Badge></TableCell>
                                <TableCell>
                                    <div className="flex -space-x-2">
                                        {task.assignedTo.map((email: string) => (
                                            <Avatar key={email} className="w-8 h-8 border">
                                                <AvatarImage src={avatars[email] || '/default-avatar.png'} />
                                                <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>{format(new Date(task.createdAt), "MMM d, yyyy")}</TableCell>
                                <TableCell>{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</TableCell>
                                <TableCell>{format(new Date(task.updatedAt), "MMM d, yyyy")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ProjectTasks;
