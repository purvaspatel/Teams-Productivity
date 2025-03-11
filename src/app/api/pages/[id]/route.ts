import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

/** 🔹 GET /api/pages/:id -> Fetch a page */
export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = context.params;

        const page = await Page.findById(id);
        if (!page) {
            return NextResponse.json({ message: "Page not found" }, { status: 404 });
        }

        return NextResponse.json(page, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching page:", error);
        return NextResponse.json({ message: "Failed to fetch page" }, { status: 500 });
    }
}

/** 🔹 PUT /api/pages/:id -> Update a page */
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = context.params;
        const updates = await req.json();

        const updatedPage = await Page.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedPage) {
            return NextResponse.json({ message: "Page not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPage, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating page:", error);
        return NextResponse.json({ message: "Failed to update page" }, { status: 500 });
    }
}

/** 🔹 DELETE /api/pages/:id -> Delete a page */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = context.params;

        const deletedPage = await Page.findByIdAndDelete(id);
        if (!deletedPage) {
            return NextResponse.json({ message: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Page deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error deleting page:", error);
        return NextResponse.json({ message: "Failed to delete page" }, { status: 500 });
    }
}