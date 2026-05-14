import express from "express";
import routes from "./routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api", routes);
app.listen(process.env.PORT ?? 5000, () => {
    console.log("server started on port " + process.env.PORT);
});
