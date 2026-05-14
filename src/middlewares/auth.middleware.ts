// import { NextFunction, Request, Response } from "express";

// export const isAdmin= async (req:Request, res:Response, next:NextFunction)=>{
//    const user= req.user
//    if(user?.type !== "admin"){
//        return res.status(403).json({
//            message: "you are not authorized to perform this action",
//        });
//    }
//    next();
// };