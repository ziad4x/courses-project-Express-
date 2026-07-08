import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
import { Otp } from "../models/otp.model";
import generateOtp from "../utils/GenerateOtp";
import { sendEmail } from "../utils/EmailService";
import asyncWrapper from "../middlewares/asyncWrapper";
import AppError from "../utils/AppError";
import verifyToken from "../middlewares/verfiyToken";
import { verifyJWT } from "../utils/verifyJWT";
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
    const { email, password } = req.cookies;
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
    const jwtToken = generateToken(
      {
        id: user._id,
        role: user.type,
      },
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = generateToken({
      id: user._id
    },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: "7d"
      }
    )
    // user.token = jwtToken;
    res.cookie("accessToken", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();
    const userObj = user.toObject() as any;
    delete userObj.password;
    res.status(200).json({ message: "Login successful", data: { userObj } });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleRefreshToken = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(
      new AppError({
        message: "refresh token not found",
        statusCode: 400,
        status: "failed",
      }),
    );
  }


  const payload = await verifyJWT<{ _id: string }>(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
  const user = await User.findById(payload._id).select("+refreshToken")
  const isRefreshTokenMatch = await bcrypt.compare(refreshToken, user!.refreshToken!)
  if (!user || !isRefreshTokenMatch) {
    await User.findByIdAndUpdate(payload._id, {
      refreshToken: null,
    });
    return next(
      new AppError({
        message: "invalid refresh token",
        statusCode: 401,
        status: "",
      }),
    );
  }
  const newRefreshToken = generateToken({
    _id: user!._id,
    role: user!.type,
  },
    {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: "7d"
    }
  )
  const newAccessToken = generateToken({
    _id: user!._id,
    role: user!.type,
  },
    {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "15m"
    }
  )
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  user!.refreshToken = hashedNewRefreshToken;
  await user!.save();

  res.status(200).json({ message: "Token refreshed successfully" });


})

export default { register, login, verifyEmail, resendOtp, handleRefreshToken };
