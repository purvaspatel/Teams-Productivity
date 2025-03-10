import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    // Connect to database
    await connectToDatabase();

    // Fetch user data (excluding password)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return user data
    return NextResponse.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    // Check if error is due to invalid token
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    
    return NextResponse.json({ message: "Failed to fetch user data" }, { status: 500 });
  }
}