import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    return res.status(err.statusCode || 500).json({
        success: false,
        status: err.status || "error",
        message: err.message || "Internal server error"
    });

};

export default errorHandler;