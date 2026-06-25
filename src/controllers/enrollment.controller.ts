import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Enrollment } from "../models/enrollments.model";
import { User } from "../models/user.model";
import { Course } from "../models/course.model";
const enrollStudent = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { studentId, courseId } = req.body;
    const studentExists = await User.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({
        message: "student not found",
      });
    }
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({
        message: "course not found",
      });
    }
    const alreadyEnrolled = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });
    if (alreadyEnrolled) {
      return res.status(400).json({
        message: "already enrolled",
      });
    }
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
    });
    await enrollment.save();
    return res.status(200).json({
      message: "success",
      data: enrollment,
    });
  },
);
export { enrollStudent };
