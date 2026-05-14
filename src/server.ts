import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import dns from "node:dns/promises"
dns.setServers([
    "8.8.8.8", "1.1.1.1"
])
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();