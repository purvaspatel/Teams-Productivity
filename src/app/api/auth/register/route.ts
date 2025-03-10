import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";
import Team from "@/lib/models/team";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { username, email, password, avatar } = await req.json();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({
        message: existingUser.email === email 
          ? "Email already in use" 
          : "Username already taken"
      }, { status: 400 });
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
      avatar: avatar || ""
    });

    // Create a default team for the user
    const teamName = `${username}'s Team`;
    const newTeam = await Team.create({
      name: teamName,
      owner: email, // Owner is the user's email
      members: [email] // Add owner as first member
    });

    return NextResponse.json({ 
      message: "User registered successfully",
      userId: newUser._id,
      teamId: newTeam._id,
      teamName: newTeam.name
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({
      message: "Failed to register user",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
