import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/team";
import User from "@/lib/models/user";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params;
    const { email, addedBy } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    console.log(`Adding ${email} to team ${id}`);

    // Add to sender's team
    await Team.findByIdAndUpdate(id, { $addToSet: { members: email } });

    // Add to receiver's team (invitee)
    await Team.findOneAndUpdate(
      { owner: email }, 
      { $addToSet: { members: addedBy } }
    );

    return NextResponse.json({ message: "Member added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json({ message: "Failed to add member" }, { status: 500 });
  }
}


/** 🔹 PUT /api/teams/:id/add-member -> Add a new member to a team */
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params; // Team ID
    const { email } = await req.json();

    console.log(`🔍 Adding member ${email} to team ID: ${id}`);

    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      console.warn(`⚠️ Team not found for ID: ${id}`);
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`⚠️ User with email ${email} not found`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is already in the team
    if (team.members.some((member: any) => member.user === email)) {
      console.warn(`⚠️ User ${email} is already in the team`);
      return NextResponse.json({ message: "User already in team" }, { status: 400 });
    }

    // Add user to team
    team.members.push({ user: email });
    await team.save();

    // Update user's document (if needed)
    user.teamId = id;
    await user.save();

    console.log(`✅ User ${email} added to team ${team.name}`);
    return NextResponse.json({ message: "User added to team", team }, { status: 200 });
  } catch (error) {
    console.error("❌ Error adding member:", error);
    return NextResponse.json({ message: "Failed to add member" }, { status: 500 });
  }
}
