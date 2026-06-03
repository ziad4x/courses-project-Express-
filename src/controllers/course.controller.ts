import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { Course } from "../models/course.model";
import AppError from "../utils/AppError";
import { Category } from "../models/categories.model";
type Filter = {
  sort?: string;
  title?: {
    $regex: string;
    $options: string;
  };

  category_id?: string;
  instructor?: {
    $regex: string;
    $options: string;
  };
  price?: {
    $gte?: number;
    $lte?: number;
  };
  duration?: {
    $gte?: number;
    $lte?: number;
  };
  rating?: {
    $gte?: number;
    $lte?: number;
  };
};
const getAllCourses = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sort =
      typeof req.query.sort === "string" ? req.query.sort : "-createdAt";
    let filter: Filter = {};
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }
    if (req.query.min_price || req.query.max_price) {
      filter.price = {};
      if (req.query.min_price) {
        filter.price.$gte = Number(req.query.min_price);
      }
      if (req.query.max_price) {
        filter.price.$lte = Number(req.query.max_price);
      }
    }
    if (req.query.min_duration || req.query.max_duration) {
      filter.duration = {};
      if (req.query.min_duration) {
        filter.duration.$gte = Number(req.query.min_duration);
      }
      if (req.query.max_duration) {
        filter.duration.$lte = Number(req.query.max_duration);
      }
    }
    if (req.query.min_rating || req.query.max_rating) {
      filter.rating = {};
      if (req.query.min_rating) {
        filter.rating.$gte = Number(req.query.min_rating);
      }
      if (req.query.max_rating) {
        filter.rating.$lte = Number(req.query.max_rating);
      }
    }
    if (req.query.category_id) {
      filter.category_id = String(req.query.category_id);
    }
    if (req.query.instructor) {
      filter.instructor = {
        $regex: String(req.query.instructor),
        $options: "i",
      };
    }

    const courses = await Course.find(filter, {
      __v: false,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const total = await Course.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      message: "success",
      data: courses,
      pagination: {
        page,
        limit,
        total,
        // totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    });
  },
);
const getCourseById = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const course = await Course.findById(req.params.id, {
      __v: false,
    });
    if (!course) {
      return next(
        new AppError({
          message: "course not found",
          statusCode: 404,
          status: "fail",
        }),
      );
    }
    return res.status(200).json({
      message: "success",
      data: course,
    });
  },
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
          status: "fail",
        }),
      );
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
      duration,
    });
    await newCourse.save();
    await Category.findByIdAndUpdate(category_id, {
      $push: {
        courses: newCourse._id,
      },
      $inc: {
        number_of_courses: 1,
      },
    });
    const courseObject = newCourse.toObject();
    const { __v, ...courseWithoutV } = courseObject as typeof newCourse & {
      __v?: number;
    };
    return res.status(201).json({
      message: "success",
      data: courseWithoutV,
    });
  },
);
const updateCourse = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      description,
      category_id,
      instructor,
      students,
      price,
      duration,
    } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title: name,
        description,
        category_id,
        instructor,
        students,
        price,
        duration,
      },
      { new: true },
    );
    if (!course) {
      return res.status(404).json({
        message: "course not found",
      });
    }
    const courseObject = course.toObject();
    const { __v, ...courseWithoutV } = courseObject as typeof course & {
      __v?: number;
    };
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
      data: courseWithoutV,
    });
  },
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
  },
);
export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
