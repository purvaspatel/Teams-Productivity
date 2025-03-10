import mongoose, { Schema, model, models } from "mongoose";

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true }, // Owner's email
    members: [{ type: String, required: true }], // Store members as emails
  },
  { timestamps: true }
);

const Team = models.Team || model("Team", TeamSchema);
export default Team;
