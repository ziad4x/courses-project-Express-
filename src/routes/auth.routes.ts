import express from "express";
import authController from "../controllers/auth.controller";
import multer from "multer";
import path from "node:path";
import AppError from "../utils/AppError";
const router = express.Router();
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/users/");
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
  if (file.mimetype.startsWith("image/")) {
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
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});
router.post("/register", upload.single("photo"), authController.register);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-otp", authController.resendOtp);
export default router;
