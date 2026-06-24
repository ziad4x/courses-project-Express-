import express from "express";
import userRouter from "./user.routes";
import courseRouter from "./course.routes";
import categoryRouter from "./category.routes";
import authRouter from "./auth.routes";
import adminRouter from "./admin.routes";
import lessonRouter from "./lesson.routes";
import googleAuthRouter from "./google_auth.routes";
const router = express.Router();

router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/categories", categoryRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/lessons", lessonRouter);
router.use("/auth/google", googleAuthRouter);
export default router;
