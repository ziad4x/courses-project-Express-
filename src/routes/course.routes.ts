import express from "express";
import courseController from "./../controllers/course.controller"
import verifyToken from "../middlewares/verfiyToken";
const router = express.Router();
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.post("/", verifyToken, courseController.createCourse);
router.put("/:id", verifyToken, courseController.updateCourse);
router.delete("/:id", verifyToken, courseController.deleteCourse);
export default router;