import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/team";


/** 🔹 GET /api/teams?email=user@example.com -> Fetch team by owner email */
export async function GET(req: NextRequest) {
  try {
    console.log('going inside try catch');
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("email");

    if (!userEmail) {
      console.log("⚠️ Missing user email in request.");
      return NextResponse.json({ message: "User email is required" }, { status: 400 });
    }

    console.log(`🔍 Fetching team for email: ${userEmail}`);
    const team = await Team.findOne({ owner: userEmail });

    if (!team) {
      console.warn(`⚠️ No team found for email: ${userEmail}`);
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    console.log("✅ Team fetched successfully:", team);
    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching team:", error);
    return NextResponse.json({ message: "Failed to fetch team" }, { status: 500 });
  }
}


/** 🔹 POST /api/teams (Create new team) */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, owner, members = [] } = await req.json();

    if (!name || !owner) {
      return NextResponse.json({ message: "Team name and owner are required" }, { status: 400 });
    }

    const newTeam = new Team({
      name,
      owner,
      members: [owner, ...members], // Owner is also a member
    });

    await newTeam.save();
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ message: "Failed to create team" }, { status: 500 });
  }
}

/** 🔹 PATCH /api/teams/:id (Add members) */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { members } = await req.json();

    if (!members || !Array.isArray(members)) {
      return NextResponse.json({ message: "Members list is required" }, { status: 400 });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      params.id,
      { $addToSet: { members: { $each: members } } }, // Prevent duplicate members
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ message: "Failed to update team" }, { status: 500 });
  }
}
