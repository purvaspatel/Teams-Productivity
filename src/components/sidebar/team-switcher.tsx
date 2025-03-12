"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronsUpDown, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTeamStore } from "@/lib/store/teamStore";
import { toast } from "sonner";
import {useRouter} from "next/navigation";
export function TeamSwitcher() {
  const { data: session } = useSession();
  const { team, fetchTeam } = useTeamStore();
  const [loading, setLoading] = useState(true);
  const router=useRouter();
  // Fetch team using email
  useEffect(() => {
    if (session?.user?.email) {
      setLoading(true);
      fetchTeam(session.user.email)
        .catch(() => toast.error("Failed to load team"))
        .finally(() => setLoading(false));
    }
  }, [session?.user?.email, fetchTeam]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground" >
                  <Users className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight cursor-pointer hover:bg-gray-100">
                  {loading ? (
                    <span className="truncate font-semibold">Loading...</span>
                  ) : (
                    <span className="truncate font-semibold">{team?.name || "My Team"}</span>
                  )}
                  <span className="truncate text-xs">Manage Team</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" align="start">
              <DropdownMenuItem onClick={() => router.push('/dashboard/team')} className="cursor-pointer hover:bg-gray-100">
                <Users className="size-4 text-muted-foreground" />
                <span>View Team</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

     
      
    </>
  );
}
