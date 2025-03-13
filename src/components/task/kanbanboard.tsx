'use client';

import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from '@/lib/interfaces/task';
import { useSession } from "next-auth/react";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, User, Filter, Plus } from 'lucide-react';
import TaskForm from "@/components/task/TaskForm";
import EditTaskForm from './EditTaskForm';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// Define the props for the KanbanBoard component
interface KanbanBoardProps {
    refresh: boolean;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define types for the drag item
interface DragItem {
    id: string;
    status: string;
}

// TaskCard component represents a single task card that can be dragged
const TaskCard = ({ task, onEdit, onDelete, onView, avatars }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TASK',
        item: { id: task._id, status: task.status } as DragItem,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [task._id, task.status]); // Add dependencies to ensure proper re-rendering

    return (
        <div ref={drag} className={`${isDragging ? 'opacity-50' : 'opacity-100'}`}>
            <Card className="mb-3 cursor-move">
                <CardContent className="p-4">
                    <div className="mb-2 flex justify-between items-start">
                        <div>
                            <Badge className="mb-2">{task.category}</Badge>
                            <h3 className="font-medium text-sm">{task.title}</h3>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onView(task._id)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(task._id)} className="text-red-500">
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">TID {task.taskID}</div>
                    
                    <div className="flex justify-between items-center">
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                            {task.priority}
                        </Badge>
                        
                        <div className="flex -space-x-2">
                            {task.assignedTo && task.assignedTo.length > 0 ? (
                                task.assignedTo.map((email) => (
                                    <Avatar key={email} className="w-6 h-6 border">
                                        <AvatarImage src={avatars[email]} />
                                        <AvatarFallback><User size={12} /></AvatarFallback>
                                    </Avatar>
                                ))
                            ) : (
                                <span className="text-gray-500 text-xs">Unassigned</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Column component represents a single column in the Kanban board
const Column = ({ title, status, tasks, onTaskDrop, onEdit, onDelete, onView, avatars }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TASK',
        drop: (item: DragItem) => onTaskDrop(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [status, onTaskDrop]); // Add dependencies to ensure proper re-rendering

    return (
        <div 
            ref={drop} 
            className={`flex-1 min-h-[70vh] p-4 rounded-lg ${isOver ? 'bg-slate-100' : 'bg-slate-50'}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-sm uppercase tracking-wide">{title}</h2>
                <Badge variant="outline">{tasks.length}</Badge>
            </div>
            
            <div className="space-y-2">
                {tasks.map((task) => (
                    <TaskCard 
                        key={task._id} 
                        task={task} 
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                        onView={onView}
                        avatars={avatars}
                    />
                ))}
            </div>
        </div>
    );
};

// Main KanbanBoard component
const KanbanBoard: React.FC<KanbanBoardProps> = ({ refresh, setRefresh }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [avatars, setAvatars] = useState<{ [email: string]: string }>({});

    // Define the columns for the Kanban board - UPDATED to match schema
    const columns = [
        { title: "To Do", status: "todo" },
        { title: "In Progress", status: "in-progress" },
        { title: "Review", status: "review" },
        { title: "Complete", status: "complete" },
        { title: "Due", status: "due" }
    ];

    /** Fetch all tasks from API */
    useEffect(() => {
        async function getAllTasks() {
            if (!session?.user?.email) return;

            try {
                const res = await fetch('/api/tasks');
                if (!res.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                
                const data = await res.json();
                
                // Filter tasks to show only those created by or assigned to the user
                const userTasks = data.filter((task: Task) =>
                    task.createdBy === session.user.email || 
                    (task.assignedTo && task.assignedTo.includes(session.user.email))
                );

                setTasks(userTasks);

                if (userTasks.length === 0) {
                    toast.info("No tasks found! You must be assigned or own tasks to view them.", { id: "no-tasks" });
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
                toast.error("Failed to load tasks");
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
        
        // Apply category filter
        if (categoryFilter) {
            result = result.filter(task => task.category === categoryFilter);
        }
        
        // Apply priority filter
        if (priorityFilter) {
            result = result.filter(task => task.priority === priorityFilter);
        }
        
        setFilteredTasks(result);
    }, [tasks, search, categoryFilter, priorityFilter]);

    /** Fetch avatars for assigned users */
    useEffect(() => {
        async function fetchAvatars() {
            // Handle case where tasks might not have assignedTo property
            const uniqueEmails = [...new Set(
                tasks
                    .filter(task => task.assignedTo && Array.isArray(task.assignedTo))
                    .flatMap(task => task.assignedTo)
            )];

            const avatarPromises = uniqueEmails.map(async (email) => {
                try {
                    const res = await fetch(`/api/user/avatar?email=${encodeURIComponent(email)}`);
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
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (res.ok) {
                setRefresh(!refresh);
                toast.success('Task deleted successfully');
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("An error occurred while deleting the task");
        }
    };

    /** Handle task drop - update task status */
    const handleTaskDrop = async (taskId: string, newStatus: string) => {
        // Find the task
        const task = tasks.find(t => t._id === taskId);
        if (!task || task.status === newStatus) return;

        try {
            // Optimistically update UI
            setTasks(prevTasks => 
                prevTasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t)
            );
            
            // Call API to update the task
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            
            if (res.ok) {
                toast.success(`Task moved to ${newStatus}`);
            } else {
                // Revert changes if API call fails
                setTasks(prevTasks => 
                    prevTasks.map(t => t._id === taskId ? { ...t, status: task.status } : t)
                );
                toast.error("Failed to update task status");
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error("An error occurred while updating task");
            
            // Revert changes if exception occurs
            setTasks(prevTasks => 
                prevTasks.map(t => t._id === taskId ? { ...t, status: task.status } : t)
            );
        }
    };

    /** Get available categories for filter */
    const getCategories = () => {
        return [...new Set(tasks.map(task => task.category))];
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-3xl">Task Board</h1>
                    <Button onClick={() => router.push('/dashboard/tasks')} variant="outline">Switch to List View</Button>
                </div>

                {editTask && <EditTaskForm task={editTask} onClose={() => setEditTask(null)} onUpdated={() => setRefresh(!refresh)} />}

                {/* Filter Bar */}
                <div className="flex items-center gap-4 my-4">
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />

                    {/* Category Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-32 flex items-center justify-between">
                                {categoryFilter || "Category"}
                                <Filter size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setCategoryFilter("")}>All Categories</DropdownMenuItem>
                            {getCategories().map(category => (
                                <DropdownMenuItem 
                                    key={category} 
                                    onClick={() => setCategoryFilter(category)}
                                >
                                    {category}
                                </DropdownMenuItem>
                            ))}
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

                {/* Kanban Board */}
                <div className="flex gap-4 overflow-x-auto pb-6">
                    {columns.map(column => (
                        <Column
                            key={column.status}
                            title={column.title}
                            status={column.status}
                            tasks={filteredTasks.filter(task => task.status === column.status)}
                            onTaskDrop={handleTaskDrop}
                            onEdit={setEditTask}
                            onDelete={handleDelete}
                            onView={(id) => router.push(`/dashboard/tasks/${id}`)}
                            avatars={avatars}
                        />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

export default KanbanBoard;