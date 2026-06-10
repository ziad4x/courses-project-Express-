import asyncWrapper from "../middlewares/asyncWrapper";
import { Course } from "../models/course.model";
import { Lesson } from "../models/lesson.model";
import AppError from "../utils/AppError";

const getAllLessons = asyncWrapper(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const count = await Lesson.countDocuments();

  const lessons = await Lesson.find()
    .populate("course")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    status: 200,
    message: "success",
    data: lessons,
    pagination: {
      page,
      limit,
      count,
      hasNextPage: page * limit < count,
      hasPrevPage: page > 1,
    },
  });
});

const getAllLessonsForCourse = asyncWrapper(async (req, res) => {
  const { courseId } = req.params;

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const count = await Lesson.countDocuments({ courseId });

  const lessons = await Lesson.find({ courseId })
    .populate("course")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    status: 200,
    message: "success",
    data: lessons,
    pagination: {
      page,
      limit,
      count,
      hasNextPage: page * limit < count,
      hasPrevPage: page > 1,
    },
  });
});

const getOneLesson = asyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId).populate("course");

  if (!lesson) {
    return next(
      new AppError({
        message: "Lesson not found",
        statusCode: 404,
        status: "fail",
      }),
    );
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: "success",
    data: lesson,
  });
});

const createLesson = asyncWrapper(async (req, res, next) => {
  const { title, description, courseId } = req.body;

  const files = req.files as {
    video?: Express.Multer.File[];
    thumbnail?: Express.Multer.File[];
  };

  const video = files?.video?.[0]?.path;
  const thumbnail = files?.thumbnail?.[0]?.path;

  if (!title || !description || !courseId) {
    return next(
      new AppError({
        message: "title, description and courseId are required",
        statusCode: 400,
        status: "fail",
      }),
    );
  }

  if (!video || !thumbnail) {
    return next(
      new AppError({
        message: "video and thumbnail are required",
        statusCode: 400,
        status: "fail",
      }),
    );
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return next(
      new AppError({
        message: "Course not found",
        statusCode: 404,
        status: "fail",
      }),
    );
  }

  const lesson = await (
    await Lesson.create({
      title,
      description,
      video,
      thumbnail,
      course: courseId,
    })
  ).populate("course");

  res.status(201).json({
    success: true,
    status: 201,
    message: "Lesson created successfully",
    data: lesson,
  });
});

const updateLesson = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const files = req.files as {
    video?: Express.Multer.File[];
    thumbnail?: Express.Multer.File[];
  };

  const video = files?.video?.[0]?.path;
  const thumbnail = files?.thumbnail?.[0]?.path;

  const updateData: Record<string, unknown> = {};

  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (video) updateData.video = video;
  if (thumbnail) updateData.thumbnail = thumbnail;

  const lesson = await Lesson.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("course");

  if (!lesson) {
    return next(
      new AppError({
        message: "Lesson not found",
        statusCode: 404,
        status: "fail",
      }),
    );
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: "Lesson updated successfully",
    data: lesson,
  });
});

const deleteLesson = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const lesson = await Lesson.findByIdAndDelete(id);

  if (!lesson) {
    return next(
      new AppError({
        message: "Lesson not found",
        statusCode: 404,
        status: "fail",
      }),
    );
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: "Lesson deleted successfully",
    data: lesson,
  });
});

export default {
  getAllLessons,
  getAllLessonsForCourse,
  getOneLesson,
  createLesson,
  updateLesson,
  deleteLesson,
};
