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
          <SidebarMenuButton onClick={() => router.push('/dashboard')}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Tasks Button */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push('/dashboard/tasks')}>
            <ClipboardPen />
            <span>Tasks</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
