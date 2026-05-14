import mongoose from 'mongoose';
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    requirements: {
        type: [String],
        required: true
    },
    learnings: {
        type: [String],
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    reviews: {
        type: [String],
        required: true
    },
    total_students: {
        type: Number,
        required: true
    },
    what_you_will_learn: {
        type: [String],
        required: true
    },
    course_id: {
        type: String,
        required: true
    }

})