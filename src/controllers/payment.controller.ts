import { NextFunction, Request, Response } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { stripe } from "../lib/stripe/stripe";
import { Course } from "../models/course.model";
import AppError from "../utils/AppError";
import { Enrollment } from "../models/enrollments.model";
import process from "process";
import Stripe from "stripe";
import mongoose from "mongoose";
import { Payment } from "../models/payment.model";
const createPaymentIntent = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);

        if (!course) {
            return next(new AppError({ message: "Course not found", statusCode: 404, status: "fail" }));
        }
        if (!course.price) {
            return next(new AppError({ message: "Course is free", statusCode: 400, status: "fail" }));
        }

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user?.id
        })
        if (enrollment) {
            return next(new AppError({ message: "Course already enrolled", statusCode: 400, status: "fail" }));
        }
        console.log(req.user, course)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.price * 100,
            currency: "egp",
            metadata: {
                courseId: course._id.toString(),
                studentId: req.user?.id.toString(),
                teacherId: course.teacher_id?.toString(),
            },
        }, {
            idempotencyKey: `${courseId}-${req.user?.id}`
        });

        res.status(200).json({
            message: "Payment Intent Created Successfully",
            status: "success",
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }
        })
    }
)
const webhook = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {

        const signature = req.headers["stripe-signature"];
        if (!signature) {
            return next(new AppError({ message: "Missing stripe signature", statusCode: 400, status: "fail" }));
        }

        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
        console.log("Webhook called");
        console.log(event.type);
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const { courseId, studentId, teacherId } = paymentIntent.metadata;
                const session = await mongoose.startSession()
                try {
                    session.startTransaction()
                    const isEnrolled = await Enrollment.findOne({
                        course: courseId,
                        student: studentId
                    }, null, { session })
                    if (isEnrolled) {
                        await session.abortTransaction()
                        return next(new AppError({ message: "Course already enrolled", statusCode: 400, status: "fail" }))
                    }
                    await Enrollment.create([{
                        student: studentId,
                        course: courseId,
                    }], { session })
                    await Payment.create([{
                        student: studentId,
                        course: courseId,
                        transactionId: paymentIntent.id,
                        amount: paymentIntent.amount / 100,
                        status: "Success",
                        teacher: teacherId
                    }], { session })
                    await Course.updateOne(
                        { _id: courseId },
                        {
                            $inc: { total_students: 1 }
                        }, { session }
                    )
                    await session.commitTransaction()
                    res.status(200).json({
                        message: "Webhook processed successfully",
                        status: "success",
                    })
                } catch (err) {
                    console.log(err)
                    await session.abortTransaction()
                    return next(
                        new AppError({
                            message: "Webhook failed",
                            statusCode: 500,
                            status: "error",
                        })
                    );
                }
                finally {
                    await session.endSession()
                }

            }
                break;
            default:
                break;
        }

    }
)

export {
    createPaymentIntent,
    webhook
}