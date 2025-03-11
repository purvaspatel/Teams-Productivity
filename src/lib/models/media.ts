import mongoose, { Schema, model, models } from "mongoose";

const MediaSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true }, 
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true }, // Store file URL (cloud storage)
    type: { type: String, enum: ["image", "video", "document"], required: true },
  },
  { timestamps: true }
);

const Media = models.Media || model("Media", MediaSchema);
export default Media;
