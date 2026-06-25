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
      required: false,
      select: false,
    },
    googleId: {
      type: String,
      required: false,
      default: null,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true, versionKey: false },
);
userSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "teacher_id",
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const User = mongoose.model("User", userSchema);
