"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar setSelectedProjectId={() => {}} setActiveComponent={() => {}} />
        <SidebarInset>
          <header className="flex h-16 items-center gap-2">
            <SidebarTrigger className="ml-1 mt-1" />
            
          </header>
          <main className="flex-1  lg:px-8 ">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
