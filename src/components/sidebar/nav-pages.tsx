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
import ProjectForm from "../projectForm/page"; 

export function NavPages() {
  const router = useRouter();
 
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false); 

  

  return (
    <SidebarGroup>
      {/* Header with Projects Label & Create Button */}
      <div className="flex items-center justify-between  mb-1">
        <SidebarGroupLabel>Documents</SidebarGroupLabel>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setOpenForm(true)} // Open modal instead of navigating
          className="h-6 w-6 text-gray-500 hover:text-gray-900"
        >
          <PlusCircle size={16} />
        </Button>
      </div>
    </SidebarGroup>
  );
}
