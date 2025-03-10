import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/lib/models/project";
import User from "@/lib/models/user";

/** Get all projects the user is part of */
export async function GET(req: NextRequest) {
    try {
      await connectToDatabase();
  
      // Extract the user email from query parameters
      const { searchParams } = new URL(req.url);
      const userEmail = searchParams.get("email");
  
      if (!userEmail) {
        return NextResponse.json({ message: "User email is required" }, { status: 400 });
      }
  
      // Find projects where the user is the owner or a member
      const projects = await Project.find({
        $or: [{ owner: userEmail }, { members: userEmail }],
      }).sort({ updatedAt: -1 });
  
      return NextResponse.json(projects, { status: 200 });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json({ message: "Failed to get projects" }, { status: 500 });
    }
  }
  

/** Create a new project */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, description, owner, members } = body; // ✅ Include members array

    if (!owner) {
      return NextResponse.json({ message: "Owner email is required" }, { status: 400 });
    }

    // Ensure owner is always in the members list
    const uniqueMembers = Array.from(new Set([owner, ...(members || [])])); // ✅ Avoid duplicates

    const newProject = new Project({
      name,
      description,
      owner,
      members: uniqueMembers, // ✅ Add all members
    });

    await newProject.save();
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ message: "Failed to create project" }, { status: 500 });
  }
}
