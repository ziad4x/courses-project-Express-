import { User } from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import bcrypt from "bcryptjs";
import errorHandler from "../middlewares/errorHandler";
import AppError from "../utils/AppError";
// type QueryFilters = {
//   $or?: {
//     name: {
//       $regex: string;
//       $options: string;
//     };
//     email: {
//       $regex: string;
//       $options: string;
//     };
//   }[];

// };
const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort ? String(req.query.sort) : "createdAt";
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const type = req.query.type ? String(req.query.type) : "";
    let filter: any = {};
    if (search) {
      filter.$or = [
        {
          name: { $regex: search, $options: "i" },
        },
        {
          email: { $regex: search, $options: "i" },
        },
      ];
    }
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(filter, {
      __v: false,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      success: true,
      message: "success",
      data: users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  },
);
const getUserById = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await User.findById(userId, {
      __v: false,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "success",
      data: user,
    });
  },
);
const createUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, type } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new AppError({
          message: "Email already exists",
          statusCode: 409,
          status: "fail",
        }),
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      type: type ?? "student",
    });
    await newUser.save();
    const userObject = newUser.toObject();
    const { __v, ...userWithoutV } = userObject as typeof userObject & {
      __v?: number;
    };
    return res.status(201).json({
      success: true,
      message: "success",
      data: userWithoutV,
    });
  },
);
const updateUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const { name, email, type } = req.body;

    // const hashedPassword = await bcrypt.hash(password, 10);
    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
      return next(
        new AppError({
          message: "user not found",
          statusCode: 404,
          status: "fail",
        }),
      );
    }
    const isEmailExist = await User.findOne({ email });
    console.log(isEmailExist?._id.toString());
    if (isEmailExist && isEmailExist._id.toString() !== userId) {
      return next(
        new AppError({
          message: "email already exists",
          statusCode: 409,
          status: "fail",
        }),
      );
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        // password: hashedPassword,
        type: type ?? "student",
      },
      { returnDocument: "after" },
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    const userObject = user.toObject();
    const { __v, ...userWithoutV } = userObject as typeof userObject & {
      __v?: number;
    };
    return res.status(200).json({
      success: true,
      message: "success",
      data: userWithoutV,
    });
  },
);

const deleteUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(
        new AppError({
          message: "user not found",
          statusCode: 404,
          status: "fail",
        }),
      );
    }
    return res.status(200).json({
      success: true,
      message: "user deleted successfully",
      // data: user
    });
  },
);
export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
