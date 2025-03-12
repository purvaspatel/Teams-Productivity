'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/interfaces/task';
import { useSession } from "next-auth/react";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, User, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskForm from "@/components/task/TaskForm";
import EditTaskForm from './EditTaskForm';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';
interface TaskListProps {
    refresh: boolean;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskList: React.FC<TaskListProps> = ({ refresh, setRefresh }) => {
    const router=useRouter();
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [avatars, setAvatars] = useState<{ [email: string]: string }>({});
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 7;

    /** Fetch all tasks from API */
    useEffect(() => {
        async function getAllTasks() {
            if (!session?.user?.email) return;

            const res = await fetch('/api/tasks');
            const data = await res.json();
            
            // Filter tasks to show only those created by or assigned to the user
            const userTasks = data.filter((task: Task) =>
                task.createdBy === session.user.email || task.assignedTo.includes(session.user.email)
            );

            setTasks(userTasks);

            if (userTasks.length === 0) {
                toast.info("No tasks found! You must be assigned or own tasks to view them.", { id: "no-tasks" });
            }
        }
        getAllTasks();
    }, [refresh, session]);

    /** Apply filters and search */
    useEffect(() => {
        let result = [...tasks];
        
        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(task => 
                task.title.toLowerCase().includes(searchLower) || 
                task.category.toLowerCase().includes(searchLower) ||
                String(task.taskID).includes(search)
            );
        }
        
        // Apply status filter
        if (statusFilter) {
            result = result.filter(task => task.status === statusFilter);
        }
        
        // Apply priority filter
        if (priorityFilter) {
            result = result.filter(task => task.priority === priorityFilter);
        }
        
        setFilteredTasks(result);
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [tasks, search, statusFilter, priorityFilter]);

    /** Fetch avatars for assigned users */
    useEffect(() => {
        async function fetchAvatars() {
            const uniqueEmails = [...new Set(tasks.flatMap(task => task.assignedTo))]; // Get unique emails

            const avatarPromises = uniqueEmails.map(async (email) => {
                try {
                    const res = await fetch(`/api/user/avatar?email=${email}`);
                    const data = await res.json();
                    return { email, avatar: res.ok ? data.avatar : "/default-avatar.png" };
                } catch (error) {
                    console.error(`Error fetching avatar for ${email}:`, error);
                    return { email, avatar: "/default-avatar.png" };
                }
            });

            const avatarResults = await Promise.all(avatarPromises);
            const avatarMap = avatarResults.reduce((acc, { email, avatar }) => {
                if (email) {
                    acc[email] = avatar;
                }
                return acc;
            }, {} as { [email: string]: string });

            setAvatars(avatarMap);
        }

        if (tasks.length > 0) {
            fetchAvatars();
        }
    }, [tasks]);

    /** Handle Delete Task */
    const handleDelete = async (taskId: string) => {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        if (res.ok) {
            setRefresh(!refresh);
            toast.success('Task deleted successfully');
        } else {
            toast.error("Failed to delete task");
        }
    };

    // Calculate pagination data
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-3xl">Your Tasks</h1>

            {editTask && <EditTaskForm task={editTask} onClose={() => setEditTask(null)} onUpdated={() => setRefresh(!refresh)} />}

            {/* Filter Bar */}
            <div className="flex items-center gap-4 my-4">
                <Input
                    placeholder="Filter tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />

                {/* Status Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-32 flex items-center justify-between">
                            {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "Status"}
                            <Filter size={14} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setStatusFilter("")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("todo")}>Todo</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("done")}>Done</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("canceled")}>Canceled</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Priority Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-32 flex items-center justify-between">
                            {priorityFilter ? priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1) : "Priority"}
                            <Filter size={14} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setPriorityFilter("")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("low")}>Low</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>Medium</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("high")}>High</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <TaskForm onTaskAdded={() => setRefresh(!refresh)} />
            </div>

            {/* Task Table */}
            <div className="bg-white border-t shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assigned to</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentTasks.length > 0 ? (
                            currentTasks.map((task) => (
                                <TableRow
                                key={task._id}
                                onClick={() => router.push(`/dashboard/tasks/${task._id}`)}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                    <TableCell>TID {task.taskID}</TableCell>
                                    <TableCell>
                                        <Badge className='mr-4'>{task.category}</Badge>{task.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={task.status === 'done' ? 'outline' :
                                                task.status === 'in-progress' ? 'destructive' :
                                                    'default'}
                                        >
                                            {task.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-2">
                                            {task.assignedTo.length > 0 ? (
                                                task.assignedTo.map((email) => (
                                                    <Avatar key={email} className="w-8 h-8 border">
                                                        <AvatarImage src={avatars[email]} />
                                                        <AvatarFallback><User size={16} /></AvatarFallback>
                                                    </Avatar>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 text-sm">You</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={() => setEditTask(task)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(task._id as string)} className="text-red-500">
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6">
                                    No tasks found matching your criteria
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {filteredTasks.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        
                        {/* Page numbers */}
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Show pages around current page
                                let pageToShow = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageToShow = Math.min(currentPage - 2 + i, totalPages);
                                    if (currentPage > totalPages - 2 && i < 2) {
                                        pageToShow = totalPages - 4 + i;
                                    }
                                }
                                
                                return (
                                    <Button
                                        key={pageToShow}
                                        variant={currentPage === pageToShow ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => paginate(pageToShow)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {pageToShow}
                                    </Button>
                                );
                            })}
                        </div>
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;