import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    courses: {
        type: [String],
        required: true
    },
    number_of_students: {
        type: Number,
        required: true
    },
    number_of_courses: {
        type: Number,
        required: true
    },


})
export const Category = mongoose.model('Category', categorySchema);