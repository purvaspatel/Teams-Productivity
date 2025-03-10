"use client";

import React from "react";
import { ChevronDown, Home, CheckSquare, Plus, User, LogOut, Settings,FolderDot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface CustomSidebarProps {
  setActiveComponent: (component: string) => void;
}

const CustomSidebar: React.FC<CustomSidebarProps> = ({ setActiveComponent }) => {
  // Dummy data
  const user = {
    name: "t2",
    email: "t2@example.com",
    avatar: "/avatars/avatar2.png"
  };

  const team = {
    name: "Acme Inc",
    plan: "Enterprise"
  };

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      action: () => setActiveComponent("dashboard")
    },
    {
      title: "View Tasks",
      icon: CheckSquare,
      action: () => setActiveComponent("tasks")
    },
    {
      title: "Add Task",
      icon: Plus,
      action: () => setActiveComponent("taskForm")
    },
    {
      title: "Add Projects",
      icon: FolderDot,
      action: () => setActiveComponent("taskForm")
    },

  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-white">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{team.name}</span>
            <span className="text-xs text-gray-500">{team.plan}</span>
          </div>
          <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-2">
              Main
            </h2>
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="secondary"

                className="w-full justify-start font-normal"
                onClick={item.action}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
                <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setActiveComponent("profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveComponent("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomSidebar;