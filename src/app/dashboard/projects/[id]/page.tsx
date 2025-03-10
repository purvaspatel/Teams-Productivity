"use client";
import ProjectDetailPage from "@/components/projects/[id]/page";

export default function Page({ params }: { params: { id: string } }) {
    return <ProjectDetailPage projectId={params.id} />; // Pass projectId directly
}
