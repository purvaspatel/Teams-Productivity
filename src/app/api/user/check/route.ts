import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    return NextResponse.json({ exists: !!user }, { status: 200 });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
