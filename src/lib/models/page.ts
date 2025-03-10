import mongoose, { Schema, model, models } from "mongoose";

const PageSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // Markdown/HTML content
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true }, // 🔥 Link to project
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Page = models.Page || model("Page", PageSchema);
export default Page;
