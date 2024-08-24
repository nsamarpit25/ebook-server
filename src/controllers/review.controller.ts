import { RequestHandler } from "express";
import ReviewModel from "../models/review.model";
import { AddReviewRequestHandler } from "../types";
import { sendErrorResponse } from "@/utils/helper";
import { isValidObjectId, Types } from "mongoose";
import BookModel from "@/models/book.model";

export const addReview: AddReviewRequestHandler = async (req, res) => {
  const { bookId, rating, content } = req.body;

  await ReviewModel.findOneAndUpdate(
    { book: bookId, user: req.user.id },
    { content, rating },
    { upsert: true }
  );

  const [result] = await ReviewModel.aggregate<{ averageRating: number }>([
    { $match: { book: new Types.ObjectId(bookId) } },
    { $group: { _id: null, averageRating: { $avg: "$rating" } } },
  ]);

  await BookModel.findByIdAndUpdate(bookId, {
    averageRating: result.averageRating,
  });

  res.json({
    message: "Review Added",
  });
};

export const getReview: RequestHandler = async (req, res) => {
  const { bookId } = req.params;

  if (!isValidObjectId(bookId)) {
    return sendErrorResponse({
      message: "Book id is not valid",
      res,
      status: 422,
    });
  }
  const review = await ReviewModel.findOne({ book: bookId, user: req.user.id });

  if (!review) {
    return sendErrorResponse({
      message: "Review not found",
      res,
      status: 404,
    });
  }

  res.json({
    content: review.content,
    rating: review.rating,
  });
};
