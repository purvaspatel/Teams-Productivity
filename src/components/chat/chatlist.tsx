"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export default function ChatList() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      if (!session?.user?.email) return;
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    }
    fetchProjects();
  }, [session]);

  return (
    <Card className="w-full h-full">
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {projects.map((project) => (
            <div
              key={project._id}
              className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => router.push(`/dashboard/chat/${project._id}`)}
            >
              <Avatar>
                <AvatarImage src={`/api/user/avatar?email=${project.owner}`} />
                <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="text-sm font-medium">{project.name}</p>
                <p className="text-xs text-gray-500">
                  Created {formatDistanceToNow(new Date(project.createdAt))} ago
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
