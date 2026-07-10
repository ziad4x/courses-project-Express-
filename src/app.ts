import express from "express";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler";
import path from "node:path";
import cookieParser from "cookie-parser";
import { webhook } from "./controllers/payment.controller";
const app = express();

app.use(cookieParser());
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  webhook
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});
app.use("/api", routes);
app.use(errorHandler);
export default app;
