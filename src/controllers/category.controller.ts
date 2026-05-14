import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Category } from "../models/categories.model";
const getAllCategories = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const categories = await Category.find();
        return res.status(200).json({
            message: "success",
            data: categories
        });
    }
);
const getCategoryById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "category not found",
            });
        }
        return res.status(200).json({
            message: "success",
            data: category
        });
    }
);
const createCategory = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, courses, number_of_students, number_of_courses } = req.body;
        const newCategory = new Category({
            name,
            description,
            courses,
            number_of_students,
            number_of_courses
        })
        await newCategory.save();
        return res.status(201).json({
            message: "success",
            data: newCategory
        });
    }
);
const updateCategory = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, courses, number_of_students, number_of_courses } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            courses,
            number_of_students,
            number_of_courses
        }, { new: true });
        if (!category) {
            return res.status(404).json({
                message: "category not found",
            });
        }
        return res.status(200).json({
            message: "success",
            data: category
        });
    }
);
const deleteCategory = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "category not found",
            });
        }
        return res.status(200).json({
            message: "success",
            data: category
        });
    }
);
export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};