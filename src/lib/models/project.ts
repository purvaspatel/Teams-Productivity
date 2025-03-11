import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true }, 
    members: [{ type: String }], 
    isPrivate: { type: Boolean, default: true }, // Private or shared project
  },
  { timestamps: true }
);

const Project = models.Project || model("Project", ProjectSchema);
export default Project;
