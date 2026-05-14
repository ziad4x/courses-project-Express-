import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("⏳ Before MongoDB connect");

        await mongoose.connect(process.env.MONGO_URL as string);

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ DB connection error:", error);
        process.exit(1);
    }
};