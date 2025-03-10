"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="View Tasks" desc="Manage and track tasks" onClick={() => router.push("/dashboard/tasks")} />
        <DashboardCard title="Profile" desc="Update your profile" onClick={() => router.push("/dashboard/profile")} />
      </div>
    </div>
  );
}

function DashboardCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col space-y-2">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <button className="mt-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300" onClick={onClick}>
        Open
      </button>
    </div>
  );
}
