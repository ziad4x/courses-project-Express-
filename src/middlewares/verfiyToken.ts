import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  // const authHeader = req.headers.authorization;
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    // req.user = decoded
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
export default verifyToken;
