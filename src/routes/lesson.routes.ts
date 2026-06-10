import express from "express";
import lessonController from "../controllers/lesson.controller";
import multer from "multer";
import path from "path";
import AppError from "../utils/AppError";
import verifyToken from "../middlewares/verfiyToken";
import AllowedTo from "../middlewares/allowedTo";
const router = express.Router();
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/lessons/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError({
        message: "Invalid file type",
        statusCode: 400,
        status: "fail",
      }),
    );
  }
};
const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 100 },
});
router.get("/", lessonController.getAllLessons);
router.get("/course/:courseId", lessonController.getAllLessonsForCourse);
router.get("/:lessonId", lessonController.getOneLesson);
router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyToken,
  AllowedTo("admin", "teacher"),
  lessonController.createLesson,
);
router.put(
  "/:id",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyToken,
  AllowedTo("admin", "teacher"),
  lessonController.updateLesson,
);
router.delete(
  "/:id",
  verifyToken,
  AllowedTo("admin", "teacher"),
  lessonController.deleteLesson,
);
export default router;
