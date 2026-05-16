import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Category } from "../models/categories.model";
import AppError from "../utils/AppError";
const getAllCategories = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const categories = await Category.find({}, {
            __v: false
        });
        return res.status(200).json({
            message: "success",
            data: categories
        });
    }
);
const getCategoryById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const category = await Category.findById(req.params.id, {
            __v: false
        });
        if (!category) {
            return next(
                new AppError({
                    message: "category not found",
                    statusCode: 404,
                    status: "fail"
                })
            )
        }
        return res.status(200).json({
            message: "success",
            data: category
        });
    }
);
const createCategory = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, slug } = req.body;
        const isCategoryExist = await Category.findOne({ slug });
        if (isCategoryExist) {
            return next(
                new AppError({
                    message: "category already exists",
                    statusCode: 409,
                    status: "fail"
                })
            )
        }

        const newCategory = new Category({
            name,
            slug,
            description,

        })
        const categoryObject = newCategory.toObject();
        const { __v, ...categoryWithoutV } = categoryObject as typeof newCategory & { __v?: number };
        await newCategory.save();
        return res.status(201).json({
            message: "success",
            data: categoryWithoutV
        });
    }
);
const updateCategory = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, description, slug } = req.body;
        const isCategoryExist = await Category.findOne({ slug });
        if (isCategoryExist && isCategoryExist._id.toString() !== req.params.id) {
            return next(
                new AppError({
                    message: "category already exists",
                    statusCode: 409,
                    status: "fail"
                })
            )
        }
        const category = await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            slug
        }, { new: true });
        if (!category) {
            return res.status(404).json({
                message: "category not found",
            });
        }
        const categoryObject = category.toObject();
        const { __v, ...categoryWithoutV } = categoryObject as typeof category & { __v?: number };
        return res.status(200).json({
            message: "success",
            data: categoryWithoutV

        });
    }
);
const deleteCategory = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return next(
                new AppError({
                    message: "category not found",
                    statusCode: 404,
                    status: "fail"
                })
            )
        }
        const categoryObject = category.toObject();
        const { __v, ...categoryWithoutV } = categoryObject as typeof category & { __v?: number };
        return res.status(200).json({
            message: "success",
            data: categoryWithoutV
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