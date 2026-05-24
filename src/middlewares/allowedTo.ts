import { Request, Response, NextFunction } from "express";
type UserType = "student" | "admin" | "teacher";
const AllowedTo = (...roles: UserType[]) => {
  const middelWare = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    console.log(user);
    if (roles.includes(user.type)) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  };
  return middelWare;
};
export default AllowedTo;
