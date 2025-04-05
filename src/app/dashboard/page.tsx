"use client";

import { useEffect, useState, JSX } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow, parseISO } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  CheckCircle,
  Clock,
  ListChecks,
  Loader,
  Calendar,
  AlertTriangle,
  BarChart
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchDashboardData(session.user.email);
    }
  }, [session]);

  /** Fetch dashboard data (tasks, projects, avatar) */
  async function fetchDashboardData(email: string) {
    try {
      setLoading(true);

      // Fetch tasks assigned to user
      const tasksRes = await fetch(`/api/tasks?email=${email}`);
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];

      // Fetch projects user is involved in
      const projectsRes = await fetch(`/api/projects?email=${email}`);
      const projectsData = projectsRes.ok ? await projectsRes.json() : [];

      // Fetch user avatar
      const avatarRes = await fetch(`/api/user/avatar?email=${email}`);
      const avatarData = avatarRes.ok ? await avatarRes.json() : { avatar: "/default-avatar.png" };

      // Make sure to only set tasks that belong to the current user
      const userTasks = tasksData.filter(task => 
        task.assignedTo && task.assignedTo.includes(email)
      );

      // Make sure to only set projects that the user is a member of
      const userProjects = projectsData.filter(project => 
        project.members && project.members.includes(email)
      );

      setTasks(userTasks);
      setProjects(userProjects);
      setUserAvatar(avatarData.avatar);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  /** Task Status Summary */
  const taskSummary = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "todo").length,
    inProgress: tasks.filter((task) => task.status === "in-progress").length,
    review: tasks.filter((task) => task.status === "review").length,
    completed: tasks.filter((task) => task.status === "complete").length,
    upcoming: tasks.filter((task) => task.dueDate && new Date(task.dueDate) > new Date()).length,
    urgent: tasks.filter((task) =>
      task.priority === "high" &&
      task.status !== "complete" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    ).length,
  };

  // Get tasks due soon (within next 3 days)
  const upcomingTasks = tasks
    .filter(task =>
      task.dueDate &&
      new Date(task.dueDate) > new Date() &&
      new Date(task.dueDate) < new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Calculate completion percentage
  const completionPercentage = tasks.length > 0
    ? Math.round((taskSummary.completed / tasks.length) * 100)
    : 0;

  return (
    <div className="flex h-screen">
      {/* Main content area */}
      <div className="flex-1">
        <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border shadow-sm">
                <AvatarImage src={userAvatar || "/default-avatar.png"} />
                <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{session?.user?.name || "User"}</h1>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/dashboard/tasks')} size="sm">
                Manage Tasks
              </Button>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              title="Total Tasks"
              value={taskSummary.total}
              icon={<ListChecks size={18} className="text-indigo-500" />}
            />
            <StatCard
              title="To-Do"
              value={taskSummary.todo}
              icon={<Clock size={18} className="text-blue-500" />}
            />
            <StatCard
              title="In Progress"
              value={taskSummary.inProgress}
              icon={<Loader size={18} className="text-amber-500" />}
            />
            <StatCard
              title="Under Review"
              value={taskSummary.review}
              icon={<Briefcase size={18} className="text-purple-500" />}
            />
            <StatCard
              title="Completed"
              value={taskSummary.completed}
              icon={<CheckCircle size={18} className="text-green-500" />}
              className="bg-green-50"
            />
            <StatCard
              title="Urgent"
              value={taskSummary.urgent}
              icon={<AlertTriangle size={18} className="text-red-500" />}
              className="bg-red-50"
            />
          </div>

          {/* Progress Overview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 shadow-sm border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Task Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-blue-500" />
                      <h3 className="font-medium">Upcoming Tasks</h3>
                    </div>
                    <p className="text-2xl font-bold">{taskSummary.upcoming}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart size={16} className="text-purple-500" />
                      <h3 className="font-medium">Projects</h3>
                    </div>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40 w-full pr-4">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  ) : upcomingTasks.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task._id}
                          className="p-2 rounded-md border flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/dashboard/tasks/${task._id}`)}
                        >
                          <div className={`w-2 h-2 rounded-full ${new Date(task.dueDate) < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                            }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              Due {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Tasks and Projects Tabs */}
          <Tabs defaultValue="tasks" className="w-full mb-20">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <Card className="shadow-sm border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Tasks Assigned to You</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 w-full pr-4">
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                      </div>
                    ) : tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between p-3 rounded-md bg-white border hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/dashboard/tasks/${task._id}`)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{task.title}</p>
                                {task.priority === "high" && (
                                  <Badge variant="outline" className="bg-red-50 text-red-600 text-xs">High</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {task.projectName && <span className="font-medium">{task.projectName}</span>}
                                {task.projectName && task.dueDate && " - "}
                                {task.dueDate && (
                                  <span>
                                    Due {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
                                  </span>
                                )}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`
                                ${task.status === "todo" ? "bg-blue-50 text-blue-700" : ""}
                                ${task.status === "in-progress" ? "bg-amber-50 text-amber-700" : ""}
                                ${task.status === "review" ? "bg-purple-50 text-purple-700" : ""}
                                ${task.status === "complete" ? "bg-green-50 text-green-700" : ""}
                              `}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tasks assigned to you.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card className="shadow-sm border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Projects You're Involved In</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 w-full pr-4">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </div>
                    ) : projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project) => (
                          <div
                            key={project._id}
                            className="flex flex-col p-4 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold truncate">{project.name}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {project.status || "Active"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                              {project.description || "No description provided."}
                            </p>
                            <div className="flex justify-between mt-auto pt-2 text-xs text-gray-500">
                              <span>{project.members?.length || 0} members</span>
                              <span>
                                {project.tasks?.length || 0} tasks
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">You are not part of any projects.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/** Reusable Stat Card */
function StatCard({
  title,
  value,
  icon,
  className = ""
}: {
  title: string;
  value: number;
  icon: JSX.Element;
  className?: string;
}) {
  return (
    <Card className={`p-3 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}