import express from "express";
import userRouter from "./user.routes";
import courseRouter from "./course.routes";
import categoryRouter from "./category.routes";
import authRouter from "./auth.routes";
const router = express.Router();

router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/categories", categoryRouter);
router.use("/auth", authRouter);

export default router;