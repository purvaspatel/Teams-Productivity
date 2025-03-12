import mongoose, { Schema, model, models } from "mongoose";

const ChatSchema = new Schema(
  {
    project: { type: String, required: true }, // Store project ID as a string
    sender: { type: String, required: true }, // Store sender email instead of ObjectId
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Chat = models.Chat || model("Chat", ChatSchema);
export default Chat;
