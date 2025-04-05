'use client';
import DashboardPage from "./dashboard/page";

export default function Home() {
  return (
    <main className="h-screen p-6">
      < a href="/dashboard" className="text-blue-500 hover:underline">
    Go to dashboard
      </a>
      <br></br>
      < a href="/register" className="text-blue-500 hover:underline">
    Create a new account
      </a>
      <br></br>
      < a href="/dashboard" className="text-blue-500 hover:underline">
    Log in to existing account
      </a>
    </main>
  );
}
