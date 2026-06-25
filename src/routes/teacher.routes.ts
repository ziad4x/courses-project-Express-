import { Router } from "express";
import AllowedTo from "../middlewares/allowedTo";
import verifyToken from "../middlewares/verfiyToken";
import teacherController from "../controllers/teacher.controller";
const router = Router();
router.get(
  "/courses/:teacherId",
  verifyToken,
  AllowedTo("teacher"),
  teacherController.getTeacherCourses,
);
export default router;
