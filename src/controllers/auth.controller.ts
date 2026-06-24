import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
import { Otp } from "../models/otp.model";
import generateOtp from "../utils/GenerateOtp";
import { sendEmail } from "../utils/EmailService";
import asyncWrapper from "../middlewares/asyncWrapper";
import AppError from "../utils/AppError";
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
      isVerified: false,
    });
    await user.save();
    const otp = generateOtp();
    const hashOtp = await bcrypt.hash(otp, 10);
    await Otp.deleteMany({ email });
    const expireIn = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({
      email,
      otp: hashOtp,
      expireAt: expireIn,
    });
    await sendEmail(otp, email, expireIn.toString());

    res.status(201).json({ message: "User created successfully", data: user });
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const verifyEmail = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError({
          message: "user not found",
          statusCode: 404,
          status: "",
        }),
      );
    }
    const otpDoc = await Otp.findOne({
      email,
      // otp,
    });
    // const otps = await Otp.find();
    // console.log(otps);
    if (!otpDoc) {
      console.log("no otp found");
      return next(
        new AppError({
          message: "invalid otp",
          statusCode: 400,
          status: "",
        }),
      );
    }
    if (otpDoc.expireAt < new Date()) {
      console.log("otp expired");
      return next(
        new AppError({ message: "otp expired", statusCode: 400, status: "" }),
      );
    }
    const isValidOtp = await bcrypt.compare(otp, otpDoc.otp);
    if (!isValidOtp) {
      console.log("invalid otp");
      return next(
        new AppError({ message: "invalid otp", statusCode: 400, status: "" }),
      );
    }
    user.isVerified = true;
    await user.save();
    return res
      .status(200)
      .json({ message: "user verified successfully", data: { user } });
  },
);
const resendOtp = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError({
          message: "user not found",
          statusCode: 404,
          status: "fail",
        }),
      );
    }
    if (user.isVerified) {
      return next(
        new AppError({
          message: "user already verified",
          statusCode: 400,
          status: "",
        }),
      );
    }
    const otp = generateOtp();
    const hashOtp = await bcrypt.hash(otp, 10);
    await Otp.deleteMany({ email });
    const expireIn = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({
      email,
      otp: hashOtp,
      expireAt: expireIn,
    });
    await sendEmail(otp, email, expireIn.toString());
    return res
      .status(200)
      .json({ message: "otp resent successfully", data: { user } });
  },
);
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return next(
        new AppError({
          message: "user not verified",
          statusCode: 403,
          status: "",
        }),
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password!);
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
export default { register, login, verifyEmail, resendOtp };
