import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    video: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { versionKey: false },
);

export const Lesson = mongoose.model("Lesson", schema);
