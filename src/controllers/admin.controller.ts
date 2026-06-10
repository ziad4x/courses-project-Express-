import { Request, Response, NextFunction } from "express";
import generateToken from "../utils/generateToken";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const jwtToken = generateToken({
      name,
      email,
      password: hashedPassword,
      type: "admin",
      isVerified: true,
    });
    const user = new User({
      name,
      email,
      password: hashedPassword,
      token: jwtToken,
      type: "admin",
      isVerified: true,
    });
    await user.save();
    const userObj = user.toObject() as any;
    delete userObj.password;
    res
      .status(201)
      .json({ message: "User created successfully", data: userObj });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.type !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const jwtToken = generateToken({
      name: user.name,
      email: user.email,
      password: user.password,
      type: user.type,
      isVerified: true,
    });
    user.token = jwtToken;
    await user.save();
    const userObj = user.toObject() as any;
    delete userObj.password;
    res.status(200).json({ message: "Login successful", data: userObj });
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export default { registerAdmin, loginAdmin };
