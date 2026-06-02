import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    type: {
      type: String,
      enum: ["student", "admin", "teacher"],
      required: true,
      default: "student",
    },
    photo: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

export const User = mongoose.model("User", userSchema);
