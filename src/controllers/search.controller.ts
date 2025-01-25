import BookModel from "@/models/book.model";
import { formatBook, sendErrorResponse } from "@/utils/helper";
import type { RequestHandler } from "express";

export const searchBooks: RequestHandler = async (req, res) => {
 const { title } = req.query;

 if (typeof title !== "string" || title?.trim().length < 3) {
  return sendErrorResponse({ res, status: 422, message: "Invalid title" });
 }

 const results = await BookModel.find({
  title: { $regex: title, $options: "i" },
 });

 res.send({ results: results.map(formatBook) });
};
