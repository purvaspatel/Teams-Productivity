"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTeamStore } from "@/lib/store/teamStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, Mail, Loader2 } from "lucide-react";

export default function TeamMembers() {
  const { data: session } = useSession();
  const { team, fetchTeam } = useTeamStore();
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the team and members when session is available
  useEffect(() => {
    if (session?.user?.email) {
      fetchTeam(session.user.email).then(() => fetchTeamMembers());
    }
  }, [session?.user?.email]);

  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!team?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/team/${team.id}`);
      if (!response.ok) throw new Error("Failed to fetch team members");

      const data = await response.json();
      const membersWithAvatars = await Promise.all(
        data.members.map(async (email: string) => {
          const avatarRes = await fetch(`/api/user/avatar?email=${email}`);
          const avatarData = await avatarRes.json();
          return { email, avatar: avatarData.avatar };
        })
      );

      setMembers(membersWithAvatars);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new member
  const handleAddMember = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!team?.id) {
      toast.error("No team found. Please try again.");
      return;
    }

    setIsAdding(true);
    try {
      // 🔹 **Step 1: Check if user exists in the database**
      const userCheckRes = await fetch(`/api/user/check?email=${email}`);
      const userData = await userCheckRes.json();

      if (!userCheckRes.ok || !userData.exists) {
        toast.error("User does not exist. Please check the email.");
        setIsAdding(false);
        return;
      }

      // 🔹 **Step 2: Send request to add the user to the team**
      const response = await fetch(`/api/team/${team.id}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, addedBy: session?.user?.email }),
      });

      if (!response.ok) throw new Error("Failed to add member");

      toast.success("Member added successfully!");
      setEmail("");
      fetchTeamMembers(); // Refresh member list
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };
  console.log(members);
  return (
    <div className="space-y-6">
      {/* Add Member Button (Opens Dialog) */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <UserPlus size={16} />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Member</DialogTitle>
            </DialogHeader>
            <Input
              type="email"
              placeholder="Enter member's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleAddMember} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Member"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members List */}
{isLoading ? (
  <div className="flex justify-center py-6">
    <Loader2 className="animate-spin text-gray-500" size={24} />
  </div>
) : members.length === 0 ? (
  <p className="text-center text-gray-500">No team members found</p>
) : (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {members.map((member) => (
      <div 
        key={member.email || member.id} 
        className="flex flex-col items-center p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={member.avatar || "/default-avatar.png"} />
          <AvatarFallback className="text-lg">
            {member.email ? member.email.substring(0, 2).toUpperCase() : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 truncate max-w-full">
            {member.email}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Team Member
          </p>
        </div>
      </div>
    ))}
  </div>
)}
</div>
);
}