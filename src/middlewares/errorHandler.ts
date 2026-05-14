import { NextFunction, Request, Response } from "express";
interface AppError extends Error {
    status?: number;
}

type errorHandlerParams = {
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
}
const errorHandler = ({ err, req, res, next }: errorHandlerParams) => {
    res.status(err.status ?? 500).json({
        message: err.message ?? "internal server error",
        status: err.status ?? 500,
    })
}
export default errorHandler