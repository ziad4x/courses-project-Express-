import { Router } from "express";
import { createPaymentIntent } from "../controllers/payment.controller";
import verifyToken from "../middlewares/verfiyToken";
import { webhook } from "../controllers/payment.controller";
import express from "express";
import allowedTo from "../middlewares/allowedTo";

const paymentRouter = Router();

paymentRouter.post("/payments/create-payment-intent", verifyToken, allowedTo("student"), createPaymentIntent);
// paymentRouter.post("/payments/webhook", express.raw({ type: "application/json" }), webhook);

export default paymentRouter;