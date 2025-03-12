"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronLeft, Lock, Pencil, Trash2, Unlock, Users, X } from "lucide-react";
import ProjectTasks from "../projecttask";
interface ProjectDetailPageProps {
  projectId: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams(); 
  const projectId = params?.id; 
  const { data: session, status } = useSession();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [avatars, setAvatars] = useState<{ [email: string]: string }>({});
  const [refresh, setRefresh] = useState(false); // ✅ Refresh state for tasks
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    members: [] as string[],
    isPrivate: false,
  });
  const [newMember, setNewMember] = useState("");
  const [checkingUser, setCheckingUser] = useState(false);

  useEffect(() => {
    if (project) {
      setEditData({
        name: project.name || "",
        description: project.description || "",
        members: project.members || [],
        isPrivate: project.isPrivate || false,
      });
    }
  }, [project]);

  const handleUpdateProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error("Failed to update project");

      toast.success("Project updated successfully!");
      setOpenEditDialog(false);
      fetchProjectData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update project");
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      setCheckingUser(true);
      const response = await fetch(`/api/user/exists?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error("Failed to check user");
      }
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    } finally {
      setCheckingUser(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember || !newMember.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (editData.members.includes(newMember)) {
      toast.error("This member is already in the project");
      return;
    }
    
    // Check if user exists in the database
    const userExists = await checkUserExists(newMember);
    
    if (!userExists) {
      toast.error("User with this email does not exist");
      return;
    }
    
    setEditData({
      ...editData,
      members: [...editData.members, newMember],
    });
    setNewMember("");
    toast.success("Member added successfully");
  };

  const handleRemoveMember = (email: string) => {
    // Prevent removing the owner
    if (email === project.owner) {
      toast.error("Cannot remove the project owner");
      return;
    }
    
    setEditData({
      ...editData,
      members: editData.members.filter(member => member !== email),
    });
    toast.success("Member removed successfully");
  };

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
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) throw new Error(`Failed to fetch project: ${projectRes.status}`);
      const projectData = await projectRes.json();
      setProject(projectData);
      fetchAvatars(projectData.members);
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  /** Fetch user avatars */
  const fetchAvatars = async (members: string[]) => {
    const avatarPromises = members.map(async (email) => {
      try {
        const res = await fetch(`/api/user/avatar?email=${email}`);
        const data = await res.json();
        return { email, avatar: res.ok ? data.avatar : "/default-avatar.png" };
      } catch {
        return { email, avatar: "/default-avatar.png" };
      }
    });

    const avatarResults = await Promise.all(avatarPromises);
    const avatarMap = avatarResults.reduce((acc, { email, avatar }) => {
      acc[email] = avatar;
      return acc;
    }, {} as { [email: string]: string });

    setAvatars(avatarMap);
  };

  /** Delete Project */
  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete project");

      toast.success("Project deleted successfully!");
      setOpenDeleteDialog(false);

      router.push("/dashboard");
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const isOwner = project && session?.user?.email === project.owner;

  if (status === "loading") return <div className="flex justify-center p-10">Loading session...</div>;
  if (loading) return <div className="flex justify-center p-10">Loading project details...</div>;

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
    <div className="container">
      {/* Navigation */}
      <Button
        variant="ghost"
        className="mb-4 -ml-3 text-gray-600"
        onClick={() => router.push("/dashboard")}
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
      </Button>

      {/* Project Header */}
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
              <Users size={14} />
              <span>{project.members?.length || 0} members</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwner && (
            <>
              {/* Edit Project Dialog */}
              <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Pencil size={14} />
                    Edit Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="projectName" className="text-sm font-medium">Project Name</label>
                      <Input 
                        id="projectName"
                        value={editData.name} 
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        placeholder="Enter project name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="projectDescription" className="text-sm font-medium">Description</label>
                      <Textarea 
                        id="projectDescription"
                        value={editData.description} 
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        placeholder="Enter project description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Privacy</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            checked={!editData.isPrivate} 
                            onChange={() => setEditData({...editData, isPrivate: false})}
                          />
                          <span className="flex items-center gap-1">
                            <Unlock size={14} />
                            Public
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            checked={editData.isPrivate} 
                            onChange={() => setEditData({...editData, isPrivate: true})}
                          />
                          <span className="flex items-center gap-1">
                            <Lock size={14} />
                            Private
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Team Members</label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-20">
                        {editData.members.map((member) => (
                          <div key={member} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                            <span className="text-sm">{member}</span>
                            <button 
                              type="button" 
                              className="text-gray-500 hover:text-red-500"
                              onClick={() => handleRemoveMember(member)}
                              disabled={member === project.owner}
                            >
                              <X size={14} />
                            </button>
                            {member === project.owner && 
                              <Badge variant="outline" className="ml-1 text-xs">Owner</Badge>
                            }
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add member by email"
                          value={newMember}
                          onChange={(e) => setNewMember(e.target.value)}
                          disabled={checkingUser}
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAddMember} 
                          disabled={checkingUser}
                        >
                          {checkingUser ? 'Checking...' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProject}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Project Dialog */}
              <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <p className="text-sm text-gray-500">
                      This action is irreversible. Deleting this project will remove all associated tasks and data.
                    </p>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteProject}>
                      Yes, Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
        
      {/* Project Description */}
      {project.description && <p className="mt-4 text-gray-600">{project.description}</p>}

      {/* Team Members */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Team Members</h2>
        <div className="flex flex-wrap gap-4">
          {project.members?.map((member: string) => (
            <div key={member} className="flex items-center gap-2 p-3 border bg-gray-50 rounded-md">
              <Avatar>
                <AvatarImage src={avatars[member] || "/default-avatar.png"} />
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
      </div>

      {/* ✅ Integrated Project Tasks */}
      <ProjectTasks projectId={projectId} refresh={refresh} setRefresh={setRefresh} />
    </div>
  );
}