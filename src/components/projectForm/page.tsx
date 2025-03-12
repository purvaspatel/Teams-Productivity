"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FolderPlus, Check, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ProjectForm({
  open,
  setOpen,
  onProjectAdded,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onProjectAdded?: () => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [avatars, setAvatars] = useState<{ [email: string]: string }>({});
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTeamMembers(session.user.email);
    }
  }, [session?.user?.email]);

  // Fetch team members from API
  {/* Fetch team members along with avatars */ }
  const fetchTeamMembers = async (email: string) => {
    try {
      const res = await fetch(`/api/team?email=${email}`);
      const data = await res.json();

      if (res.ok) {
        setTeamMembers(data.members || []);

        // Fetch avatars for team members
        const avatarPromises = data.members.map(async (memberEmail: string) => {
          const avatarRes = await fetch(`/api/user/avatar?email=${memberEmail}`);
          const avatarData = await avatarRes.json();
          return { email: memberEmail, avatar: avatarRes.ok ? avatarData.avatar : "/default-avatar.png" };
        });

        const avatarResults = await Promise.all(avatarPromises);
        const avatarMap = avatarResults.reduce((acc, { email, avatar }) => {
          acc[email] = avatar;
          return acc;
        }, {} as { [email: string]: string });

        setAvatars(avatarMap);
      } else {
        console.warn("No team members found:", data.message);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to fetch team members");
    }
  };


  // Toggle selection of members
  const toggleMemberSelection = (email: string) => {
    setSelectedMembers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Project name is required!");
      return;
    }

    if (!session?.user?.email) {
      toast.error("You must be logged in to create a project");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        owner: session.user.email,
        members: [session.user.email, ...selectedMembers], // Ensure owner is always included
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Project created successfully!");
        setOpen(false);
        setName("");
        setDescription("");
        setSelectedMembers([]);
        window.location.reload();
        router.push(`/dashboard/projects/${data._id}`);
        
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create project");
      }
    } catch (error: any) {
      toast.error(`Failed to create project: ${error.message}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FolderPlus className="text-blue-500" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">Project Name</Label>
            <Input
              id="name"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-gray-300 focus:border-blue-500"
              rows={4}
            />
          </div>

          {/* Select Members */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-1">
              <Users size={16} /> Add Team Members
            </Label>
            <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-gray-500">No team members found</p>
              ) : (
                teamMembers.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleMemberSelection(email)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={avatars[email] || "/default-avatar.png"} />
                        <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{email}</p>
                      </div>
                    </div>

                    {selectedMembers.includes(email) && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Check size={14} />
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
