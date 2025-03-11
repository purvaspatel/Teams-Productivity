import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

/** 🔹 POST /api/pages -> Create a new page */
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { title, content, project, createdBy } = await req.json();

        if (!title || !content || !project || !createdBy) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const newPage = new Page({ title, content, project, createdBy });
        await newPage.save();

        return NextResponse.json(newPage, { status: 201 });
    } catch (error) {
        console.error("Error creating page:", error);
        return NextResponse.json({ message: "Failed to create page" }, { status: 500 });
    }
}