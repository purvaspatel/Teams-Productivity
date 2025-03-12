"use client";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardPen } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain(){
  const router=useRouter();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {/* Dashboard Button */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push('/dashboard')} className="cursor-pointer hover:bg-gray-100">
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Tasks Button */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push('/dashboard/tasks')} className="cursor-pointer hover:bg-gray-100">
            <ClipboardPen />
            <span>Tasks</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
