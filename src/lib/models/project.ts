import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true }, // 🔥 Changed from ObjectId to email
    members: [{ type: String }], // 🔥 Store team members as emails
    isPrivate: { type: Boolean, default: true }, // Private or shared project
  },
  { timestamps: true }
);

const Project = models.Project || model("Project", ProjectSchema);
export default Project;
