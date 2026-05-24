import express from "express";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});
app.use("/api", routes);
app.use(errorHandler);
export default app;
