"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TaskForm from "@/components/task/TaskForm";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Edit2,
  Lock,
  Settings,
  Share2,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";

import { format } from "date-fns";

interface ProjectDetailPageProps {
  projectId: String;
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "loading" && projectId) {
      fetchProjectData();
    }
  }, [projectId, status]);

  /** Fetch project details */
  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) throw new Error(`Failed to fetch project: ${projectRes.status}`);
      const projectData = await projectRes.json();
      console.log("Project data fetched:", projectData);
      setProject(projectData);
    } catch (err: any) {
      console.error("Error fetching project data:", err);
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };
  const isOwner = project && session?.user?.email === project.owner;
  if (status === "loading") {
    return <div className="flex justify-center p-10">Loading session...</div>;
  }
  if (loading) {
    return <div className="flex justify-center p-10">Loading project details...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="my-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Projects
        </Button>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="my-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/projects")}>
          Return to Projects
        </Button>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation and header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-3 text-gray-600"
          onClick={() => router.push("/dashboard/projects")}
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Projects
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.isPrivate ? <Lock size={16} className="text-gray-500" /> : <Unlock size={16} className="text-gray-500" />}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Updated {format(new Date(project.updatedAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{project.members?.length || 0} members</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Edit2 size={14} />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 size={14} />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 size={14} />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {project.description && <p className="mt-4 text-gray-600">{project.description}</p>}
      </div>
      {/* Team members section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
          <CardDescription>People with access to this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {project.members?.map((member: string) => (
              <div key={member} className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>{member.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member}</p>
                  <p className="text-sm text-gray-500">{member}</p>
                </div>
                {member === project.owner && <Badge variant="outline" className="ml-2">Owner</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}