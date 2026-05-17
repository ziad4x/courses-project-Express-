import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Course } from "../models/course.model";
import AppError from "../utils/AppError";
import { Category } from "../models/categories.model";
const getAllCourses = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const courses = await Course.find({}, {
            __v: false
        });
        return res.status(200).json({
            message: "success",
            data: courses
        });
    }
);
const getCourseById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const course = await Course.findById(req.params.id, {
            __v: false
        });
        if (!course) {
            return next(
                new AppError({
                    message: "course not found",
                    statusCode: 404,
                    status: "fail"
                })
            )
        }
        return res.status(200).json({
            message: "success",
            data: course
        });
    }
);
const createCourse = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, category_id, price, duration } = req.body;
        const isCategoryExist = await Category.findById(category_id);
        if (!isCategoryExist) {
            return next(
                new AppError({
                    message: "category not found",
                    statusCode: 404,
                    status: "fail"
                })
            )
        }
        // const isSlugExist = await Course.findOne({ slug: categorSlug });
        // if (isSlugExist) {
        //     return next(
        //         new AppError({
        //             message: "category slug already exists",
        //             statusCode: 409,
        //             status: "fail"
        //         })
        //     )
        // }
        const newCourse = new Course({
            title: name,
            description,
            category_id,
            price,
            duration
        })
        await newCourse.save();
        await Category.findByIdAndUpdate(category_id, {
            $push: {
                courses: newCourse._id
            },
            $inc: {
                number_of_courses: 1
            }
        })
        const courseObject = newCourse.toObject();
        const { __v, ...courseWithoutV } = courseObject as typeof newCourse & { __v?: number };
        return res.status(201).json({
            message: "success",
            data: courseWithoutV
        });
    }
);
const updateCourse = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, category_id, instructor, students, price, duration } = req.body;
        const course = await Course.findByIdAndUpdate(req.params.id, {
            title: name,
            description,
            category_id,
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
        const courseObject = course.toObject();
        const { __v, ...courseWithoutV } = courseObject as typeof course & { __v?: number };
        // await Category.findByIdAndUpdate(req.params.id, {
        //     $push: {
        //         courses: course._id
        //     },
        //     // $inc: {
        //     //     number_of_courses: 1
        //     // }
        // })
        return res.status(200).json({
            message: "success",
            data: courseWithoutV
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
            message: "deleted course successfully",
            // data: course
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