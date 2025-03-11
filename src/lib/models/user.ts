import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

// Hash password 
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = models.User || model("User", UserSchema);
export default User;
