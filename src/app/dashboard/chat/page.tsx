'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  _id: string;
  project: string;
  sender: string;
  message: string;
  createdAt: string;
}

export default function ChatDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?email=${session.user?.email}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session]);

  useEffect(() => {
    if (!selectedProject) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${selectedProject._id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [selectedProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject || !session?.user?.email) return;

    try {
      const response = await fetch(`/api/chat/${selectedProject._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderEmail: session.user.email,
          message: newMessage,
        }),
      });

      if (response.ok) {
        const messagesResponse = await fetch(`/api/chat/${selectedProject._id}`);
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        }
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return <div className="flex items-center justify-center h-screen">Please sign in to access chat.</div>;
  }

  return (
    <div className="flex h-[90vh] w-full my-10 bg-gray-100">

      {/* Projects sidebar */}
      <Card className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-300">
          <h2 className="text-xl font-semibold">Projects</h2>
        </div>
        <ScrollArea className="flex-1">
          {projects.map((project) => (
            <div
              key={project._id}
              className={`flex items-center p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedProject?._id === project._id ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedProject(project)}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold">{project.name}</h3>
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Chat area with fixed layout */}
      <div className="flex-1 flex flex-col h-full">
        {selectedProject ? (
          <>
            {/* Fixed header */}
            <div className="p-4 bg-gray-50 border-b flex items-center">
              <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
            </div>
            
            {/* Scrollable message area that takes remaining height */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto p-4">
                {messages.map((msg) => (
                  <div key={msg._id} className={`mb-4 ${msg.sender === session?.user?.email ? 'text-right' : 'text-left'}`}> 
                    <div className={`inline-block rounded-lg p-2 max-w-sm ${
                      msg.sender === session?.user?.email 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Fixed input area at bottom */}
            <form onSubmit={handleSendMessage} className="p-3 bg-gray-100 border-t flex items-center">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()} className="ml-2">Send</Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
            Select a project to start chatting
          </div>
        )}
      </div>
    </div>
  );
}