import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Category } from "../models/categories.model";
import AppError from "../utils/AppError";
type Filter = {
  name?: {
    $regex: string;
    $options: string;
  };
  sort?: string;
  number_of_courses?: {
    $gte?: number;
    $lte?: number;
  };
  number_of_students?: {
    $gte?: number;
    $lte?: number;
  };
};
const getAllCategories = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sort =
      typeof req.query.sort === "string" ? req.query.sort : "-createdAt";
    const skip = (page - 1) * limit;

    let filter: Filter = {};
    console.log(filter);
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (req.query.min_courses || req.query.max_courses) {
      filter.number_of_courses = {};

      if (req.query.min_courses) {
        filter.number_of_courses.$gte = Number(req.query.min_courses);
      }

      if (req.query.max_courses) {
        filter.number_of_courses.$lte = Number(req.query.max_courses);
      }
    }
    if (req.query.min_students || req.query.max_students) {
      filter.number_of_students = {};

      if (req.query.min_students) {
        filter.number_of_students.$gte = Number(req.query.min_students);
      }

      if (req.query.max_students) {
        filter.number_of_students.$lte = Number(req.query.max_students);
      }
    }
    const total = await Category.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const filteredCategories = await Category.find(filter, { __v: false })
      .skip(skip)
      .limit(limit)
      .populate("courses")
      .sort(sort);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: filteredCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    });
  },
);
const getCategoryById = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id, {
      __v: false,
    }).populate("courses");
    if (!category) {
      return next(
        new AppError({
          message: "category not found",
          statusCode: 404,
          status: "fail",
        }),
      );
    }
    return res.status(200).json({
      message: "success",
      data: category,
    });
  },
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
          status: "fail",
        }),
      );
    }

    const newCategory = new Category({
      name,
      slug,
      description,
    });
    const categoryObject = newCategory.toObject();
    const { __v, ...categoryWithoutV } =
      categoryObject as typeof newCategory & { __v?: number };
    await newCategory.save();
    return res.status(201).json({
      message: "success",
      data: categoryWithoutV,
    });
  },
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
          status: "fail",
        }),
      );
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        slug,
      },
      { new: true },
    );
    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }
    const categoryObject = category.toObject();
    const { __v, ...categoryWithoutV } = categoryObject as typeof category & {
      __v?: number;
    };
    return res.status(200).json({
      message: "success",
      data: categoryWithoutV,
    });
  },
);
const deleteCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return next(
        new AppError({
          message: "category not found",
          statusCode: 404,
          status: "fail",
        }),
      );
    }
    return res.status(200).json({
      message: "deleted successfully",
    });
  },
);
export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
