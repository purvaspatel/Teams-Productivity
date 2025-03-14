"use client";
import { useRouter } from "next/navigation";
import { PencilRuler } from 'lucide-react';
import { MessageCircleMore } from 'lucide-react';
import { LayoutDashboard, ClipboardPen } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Folder, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function NavMain() {
  const router = useRouter();
  return (
    <SidebarGroup>

      <SidebarGroupLabel  >Platform</SidebarGroupLabel>

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

        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push('/dashboard/chat')} className="cursor-pointer hover:bg-gray-100">
          <MessageCircleMore />
            <span>Messages</span>
          </SidebarMenuButton>
        </SidebarMenuItem>


        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push('/dashboard/whiteboard')} className="cursor-pointer hover:bg-gray-100">
            <PencilRuler />
            <span>Whiteboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
