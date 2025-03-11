"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", avatar: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatar: string) => {
    setFormData({ ...formData, avatar });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1000);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow flex">
        {/* Left - Registration Form */}
        <div className="w-1/2 border-r pr-6">
          <h1 className="text-2xl font-bold text-center">Create an account</h1>
          <p className="text-sm text-muted-foreground text-center">Enter your details below</p>
          <form onSubmit={handleSubmit} className="grid gap-6 mt-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" placeholder="Your username" required onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Login
            </a>
          </div>
        </div>

        {/* Right - Avatar Selection */}
        <div className="w-1/2 pl-6 flex flex-col items-center">
          <h2 className="text-xl font-bold">Choose Your Avatar (Optional)</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">Pick an avatar to personalize your profile</p>
          <div className="grid grid-cols-3 gap-3">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-1 cursor-pointer transition ${
                  formData.avatar === avatar ? "border-blue-500" : "border-gray-300 hover:border-gray-500"
                }`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                <img src={avatar} alt={`Avatar ${index + 1}`} className="rounded-lg w-full h-20 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
