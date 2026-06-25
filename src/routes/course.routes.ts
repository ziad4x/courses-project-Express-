import express from "express";
import courseController from "./../controllers/course.controller";
import allowedTo from "../middlewares/allowedTo";
import verifyToken from "../middlewares/verfiyToken";
const router = express.Router();
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.post(
  "/",
  verifyToken,
  allowedTo("admin", "teacher"),
  courseController.createCourse,
);
router.put(
  "/:id",
  verifyToken,
  allowedTo("admin", "teacher"),
  courseController.updateCourse,
);
router.delete(
  "/:id",
  verifyToken,
  allowedTo("admin", "teacher"),
  courseController.deleteCourse,
);
export default router;
