import mongoose from "mongoose";
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    requirements: {
      type: [String],
      // required: true
    },
    learnings: {
      type: [String],
      // required: true
    },
    instructor: {
      type: String,
      // required: true
    },
    rating: {
      type: Number,
      // required: true
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: [String],
      // required: true
    },
    total_students: {
      type: Number,
      // required: true
      default: 0,
    },
    what_you_will_learn: {
      type: [String],
      // required: true
    },
    category_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);
export const Course = mongoose.model("Course", courseSchema);
