import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/lib/models/project";
import Task from "@/lib/models/task";
import Chat from "@/lib/models/chat";
/** Get a specific project by ID */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const project = await Project.findOne({ _id: params.id });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    console.log(project);
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ message: "Failed to get project" }, { status: 500 });
  }
}

/** Update project details */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const updatedProject = await Project.findOneAndUpdate({ _id: params.id }, body, { new: true });

    if (!updatedProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ message: "Failed to update project" }, { status: 500 });
  }
}



export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const projectId = params.id; // projectId is stored as a string in Chat

    // Ensure the project exists before attempting deletion
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // 🔹 Delete all tasks associated with this project
    await Task.deleteMany({ project: projectId });

    // 🔹 Delete all chats associated with this project (matching string ID)
    await Chat.deleteMany({ project: projectId });

    // 🔹 Finally, delete the project
    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({ message: "Project, tasks, and chats deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting project, tasks, and chats:", error);
    return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
  }
}

