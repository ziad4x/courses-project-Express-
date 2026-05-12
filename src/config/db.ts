const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.log(error);
    }
}