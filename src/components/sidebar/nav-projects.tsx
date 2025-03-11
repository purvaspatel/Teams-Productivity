"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Folder, PlusCircle } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ProjectForm from "../projectForm/page"; // ✅ Import ProjectForm

export function NavProjects({ setSelectedProjectId }: { setSelectedProjectId: (id: string | null) => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false); // ✅ State for modal

  useEffect(() => {
    async function fetchProjects() {
      if (!session?.user?.email) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/projects?email=${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [session]);

  return (
    <SidebarGroup>
      {/* Header with Projects Label & Create Button */}
      <div className="flex items-center justify-between px-2 mb-1">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setOpenForm(true)} // Open modal instead of navigating
          className="h-6 w-6 text-gray-500 hover:text-gray-900"
        >
          <PlusCircle size={16} />
        </Button>
      </div>

      {/* Project List */}
      <SidebarMenu>
        {loading ? (
          <p className="px-4 py-2 text-gray-500">Loading projects...</p>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <SidebarMenuItem key={project._id}>
              <SidebarMenuButton onClick={() => router.push(`/dashboard/projects/${project._id}`)}>
                <Folder />
                <span>{project.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          <p className="px-4 py-2 text-gray-500">No projects available</p>
        )}
      </SidebarMenu>

      {/* ProjectForm Modal */}
      <ProjectForm 
        open={openForm} 
        setOpen={setOpenForm} 
        onProjectAdded={() => {
          setOpenForm(false);
          location.reload(); // Refresh sidebar after adding a project
        }} 
      />
    </SidebarGroup>
  );
}
