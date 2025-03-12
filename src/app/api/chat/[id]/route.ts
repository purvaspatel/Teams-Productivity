import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Chat from "@/lib/models/chat";

/** Fetch all messages for a project */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const messages = await Chat.find({ project: params.id }).sort({ createdAt: 1 }); // Fetch messages sorted
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ message: "Failed to fetch chat" }, { status: 500 });
  }
}

/** Send a message */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { senderEmail, message } = await req.json(); // Use senderEmail instead of senderId

    if (!senderEmail || !message) {
      return NextResponse.json({ message: "Sender email and message are required" }, { status: 400 });
    }

    // Create a new message with the project ID from the route parameter
    const newMessage = new Chat({
      project: params.id, // Use the ID from the route params
      sender: senderEmail,
      message: message
    });
    
    await newMessage.save();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }
}