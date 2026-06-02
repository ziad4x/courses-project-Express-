import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, type } = req.body;
    const photo = req.file;
    console.log("photo", photo);
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const jwtToken = generateToken({
      name,
      email,
      password: hashedPassword,
      type,
    });
    const user = new User({
      name,
      email,
      password: hashedPassword,
      type,
      token: jwtToken,
      photo: photo?.path,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully", data: user });
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const jwtToken = generateToken({
      username: user.name,
      email: user.email,
      password: user.password,
      type: user.type,
    });
    user.token = jwtToken;
    await user.save();
    const userObj = user.toObject() as any;
    delete userObj.password;
    res.status(200).json({ message: "Login successful", data: userObj });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default { register, login };
