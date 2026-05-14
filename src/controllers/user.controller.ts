import { User } from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import bcrypt from "bcryptjs";
const getAllUsers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const users = await User.find({}, {
            __v: false
        });
        return res.status(200).json({
            success: true,
            message: "success",
            data: users
        })

    }
)
const getUserById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const user = await User.findById(userId, {
            __v: false
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            })
        }
        return res.status(200).json({
            success: true,
            message: "success",
            data: user
        })
    }
)
const createUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, type } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            type: type ?? "student"
        })
        await newUser.save();
        const userObject = newUser.toObject();
        const { __v, ...userWithoutV } = userObject as typeof userObject & { __v?: number };
        return res.status(201).json({
            success: true,
            message: "success",
            data: userWithoutV
        });
    }
)
const updateUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {

        const userId = req.params.id;
        const { name, email, type } = req.body;
        // const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(userId, {
            name,
            email,
            // password: hashedPassword,
            type: type ?? "student"
        }, { returnDocument: "after" });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            })
        }
        const userObject = user.toObject();
        const { __v, ...userWithoutV } = userObject as typeof userObject & { __v?: number };
        return res.status(200).json({
            success: true,
            message: "success",
            data: userWithoutV
        })
    }
)

const deleteUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            })
        }
        return res.status(200).json({
            success: true,
            message: "user deleted successfully",
            // data: user
        })
    }
)
export {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
