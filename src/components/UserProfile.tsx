"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center text-gray-500">Loading user data...</p>;
  }

  if (!session?.user) {
    return <p className="text-center text-red-500">User not found. Please log in.</p>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 text-center">
      <Avatar className="w-20 h-20 mx-auto mb-4">
        <AvatarImage src={session.user.image || "/avatar/default.png"} alt="User Avatar" />
        <AvatarFallback>{session.user.name?.charAt(0) || "?"}</AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-bold">{session.user.name || "User"}</h2>
      <p className="text-gray-600">{session.user.email}</p>
    </div>
  );
}
