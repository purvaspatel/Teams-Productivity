"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

export function AppSidebar({
  setSelectedProjectId,
  setActiveComponent,
}: {
  setSelectedProjectId: (id: string | null) => void;
  setActiveComponent: (component: string) => void;
}) {
  const { data: session } = useSession();
  const [team, setTeam] = useState<any>(null);

  // Fetch user's team on mount
  useEffect(() => {
    async function fetchTeams() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/teams?email=${session.user.email}`);
        if (res.ok) {
          const teams = await res.json();
          setTeam(teams.length ? teams[0] : null);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
    fetchTeams();
  }, [session]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher onTeamChange={(newTeam) => setTeam(newTeam)} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain setActiveComponent={setActiveComponent} />
        <NavProjects setSelectedProjectId={setSelectedProjectId} />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
          <NavUser
            user={{
              name: session.user.name || "",
              email: session.user.email || "",
              avatar: session.user.image || "",
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
