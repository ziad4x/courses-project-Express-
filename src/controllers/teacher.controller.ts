import asyncWrapper from "../middlewares/asyncWrapper";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
const getTeacherCourses = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { teacherId } = req.params;
    const teacherCourses = await User.findById(teacherId).populate("courses");
    if (!teacherCourses) {
      return res.status(404).json({
        message: "teacher not found",
      });
    }
    return res.status(200).json({
      message: "success",
      data: teacherCourses,
    });
  },
);
const getTeacherStudents = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { teacherId } = req.params;
    const teacherCourses = await User.findById(teacherId).populate("students");
    if (!teacherCourses) {
      return res.status(404).json({
        message: "teacher not found",
      });
    }
    return res.status(200).json({
      message: "success",
      data: teacherCourses,
    });
  },
);
export default { getTeacherCourses, getTeacherStudents };
