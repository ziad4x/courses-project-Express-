import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Course } from "../models/course.model";
const getAllCourses = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const courses = await Course.find();
        return res.status(200).json({
            message: "success",
            data: courses
        });
    }
);
const getCourseById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                message: "course not found",
            });
        }
        return res.status(200).json({
            message: "success",
            data: course
        });
    }
);
const createCourse = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, category, instructor, students, price, duration } = req.body;
        const newCourse = new Course({
            name,
            description,
            category,
            instructor,
            students,
            price,
            duration
        })
        await newCourse.save();
        return res.status(201).json({
            message: "success",
            data: newCourse
        });
    }
);
const updateCourse = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, category, instructor, students, price, duration } = req.body;
        const course = await Course.findByIdAndUpdate(req.params.id, {
            name,
            description,
            category,
            instructor,
            students,
            price,
            duration
        }, { new: true });
        if (!course) {
            return res.status(404).json({
                message: "course not found",
            });
        }
        return res.status(200).json({
            message: "success",
            data: course
        });
    }
);
const deleteCourse = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({
                message: "course not found",
            });
        }
        return res.status(200).json({
            message: "success",
            data: course
        });
    }
);
export default {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};