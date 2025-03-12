"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Send } from "lucide-react";

export default function ChatPage() {
  const { projectId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/chat/${projectId}`);
      const data = await res.json();
      setMessages(data);
    }
    fetchMessages();
  }, [projectId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const res = await fetch(`/api/chat/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderEmail: session?.user?.email, message: newMessage.trim() }), // Use senderEmail
    });

    if (res.ok) {
      const data = await res.json();
      setMessages([...messages, data]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Messages */}
      <ScrollArea className="flex-grow p-4 border-b">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex items-start gap-3 mb-3 ${msg.sender === session?.user?.email ? "justify-end" : ""}`}>
            <Avatar>
              <AvatarImage src={`/api/user/avatar?email=${msg.sender}`} />
              <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="bg-gray-200 rounded-lg p-2 max-w-xs">
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs text-gray-500">{format(new Date(msg.createdAt), "hh:mm a")}</p>
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 flex items-center border-t bg-white">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button onClick={sendMessage} className="ml-2">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
