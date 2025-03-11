import mongoose, { Schema, model, models } from "mongoose";

const ChatSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true }, 
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Chat = models.Chat || model("Chat", ChatSchema);
export default Chat;
