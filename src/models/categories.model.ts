import mongoose from "mongoose";
import { timeStamp } from "node:console";
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    number_of_students: {
      type: Number,
      default: 0,
    },

    number_of_courses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false },
);
export const Category = mongoose.model("Category", categorySchema);
