import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/team"; 


export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = context.params;

        console.log(`🔍 Fetching team with ID: ${id}`);

        const team = await Team.findById(id);

        if (!team) {
            console.warn(`⚠️ Team not found for ID: ${id}`);
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        console.log("✅ Team fetched successfully:", team);
        return NextResponse.json(team, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching team:", error);
        return NextResponse.json({ message: "Failed to fetch team" }, { status: 500 });
    }
}


/** 🔹 PUT /api/teams/:id -> Update team (Add/remove members, change name) */
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = context.params; // ✅ Correct destructuring
        const updates = await req.json();

        const updatedTeam = await Team.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedTeam) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTeam, { status: 200 });
    } catch (error) {
        console.error("Error updating team:", error);
        return NextResponse.json({ message: "Failed to update team" }, { status: 500 });
    }
}

/** 🔹 DELETE /api/teams/:id -> Delete a team */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = context.params; // ✅ Correct destructuring

        const deletedTeam = await Team.findByIdAndDelete(id);

        if (!deletedTeam) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting team:", error);
        return NextResponse.json({ message: "Failed to delete team" }, { status: 500 });
    }
}
