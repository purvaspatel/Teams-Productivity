'use client';
import { useState } from "react";

import Dashboard from "./dashboard/page";

export default function Home() {
  const [refresh, setRefresh] = useState(false);
  return (
    <main className="min-h-screen p-6">
      <Dashboard/>
    </main>
  )
}