"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeamMembers from "@/components/team/TeamMembers";

export default function TeamPage({ params }: { params: { id: string } }) {
  const teamId = params.id;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/${teamId}`);
        const teamData = await response.json();
        setTeam(teamData);
        
        // Check if current user is the owner
        if (session?.user?.email) {
          setIsOwner(teamData.owner === session.user.email);
        }
        
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [teamId, session, status, router]);

  if (status === "loading" || loading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (!team) {
    return <div className="container py-10">Team not found</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{team.name}</h1>
      
      <div className="grid gap-6">
        <TeamMembers teamId={teamId} isOwner={isOwner} />
        
        {/* Other team sections */}
      </div>
    </div>
  );
}