import { googleClient } from "../lib/google/OAuthClinet";
import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import AppError from "../utils/AppError";
import { User } from "../models/user.model";
import generateToken from "../utils/generateToken";

const googleAuth = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.query;

    if (role !== "student" && role !== "teacher") {
      return next(
        new AppError({
          message: "invalid role",
          statusCode: 400,
          status: "fail",
        }),
      );
    }

    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state: JSON.stringify({
        role,
      }),
    });
    console.log(url);

    res.redirect(url);
  },
);
const googleCallback = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, state } = req.query;
    const { role, redirect } = JSON.parse(state as string);
    const { tokens } = await googleClient.getToken(code as string);
    googleClient.setCredentials(tokens);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload?.email });
    if (!user) {
      user = new User({
        name: payload?.name,
        email: payload?.email,
        photo: payload?.picture,
        type: role as string,
        google_id: payload?.sub,
        provider: "google",
        isVerified: true,
      });
    } else if (user && user.provider === "local") {
      return next(
        new AppError({
          message: "user already exists",
          statusCode: 409,
          status: "fail",
        }),
      );
    }
    const accesstoken = generateToken({
      id: user._id,
      name: payload?.name,
      email: payload?.email,

      type: user.type,
    });


    // user.token = accesstoken;
    await user.save();
    res.cookie("accessToken", accesstoken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    const refreshToken = generateToken(
      {
        id: user._id,
        name: payload?.name,
        email: payload?.email,

        type: user.type,
      },
      {
        expiresIn: "7d",
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // res.redirect(`http://localhost:3000/${redirect || ""}`);
    if (user.type === "student") {
      return res.redirect("http://localhost:3000/student");
    } else if (user.type === "teacher") {
      return res.redirect("http://localhost:3000/teacher");
    }
  },
);
export { googleAuth, googleCallback };
