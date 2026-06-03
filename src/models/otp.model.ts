import mongoose from "mongoose";
const Schema = mongoose.Schema;
const otpschema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);
otpschema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export const Otp = mongoose.model("Otp", otpschema);
