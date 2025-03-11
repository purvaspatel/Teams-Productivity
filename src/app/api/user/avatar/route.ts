import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ avatar: user.avatar || "/default-avatar.png" });
  } catch (error) {
    console.error("Error fetching user avatar:", error);
    return NextResponse.json({ message: "Failed to fetch avatar" }, { status: 500 });
  }
}
