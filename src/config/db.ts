import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

export const connectDB = async () => {
    try {
        if (!MONGO_URL) {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.log(error);
    }
};