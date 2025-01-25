import { Request, Response } from "express";
import { UserDoc } from "../models/user.model";
import type { BookDoc } from "@/models/book.model";
import type { AggregationResult } from "@/controllers/book.controller";

type ErrorResponseType = {
 status: number;
 message: string;
 res: Response;
};

export const sendErrorResponse = ({
 status,
 message,
 res,
}: ErrorResponseType) => {
 return res.status(status).json({ message });
};

export const formatUserProfile = (user: UserDoc): Request["user"] => {
 return {
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar?.url,
  signedUp: user.signedUp,
  authorId: user.authorId?.toString(),
  books: user.books.map((book) => book.toString()),
 };
};

export function formatFileSize(bytes: number) {
 if (bytes === 0) return "0 Bytes";
 const k = 1024;
 const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function sanitizeUrl(url: string) {
 return url.replace(/  /g, "%20");
}

interface FormattedBooks {
 id: string;
 title: string;
 genre: string;
 slug: string;
 cover?: string;
 rating?: string;
 price: {
  mrp: string;
  sale: string;
 };
}

export const formatBook = (
 book: BookDoc | AggregationResult
): FormattedBooks => {
 const { _id, title, slug, genre, price, cover, averageRating } = book;

 return {
  id: _id?.toString() || "",
  title: title,
  slug: slug,
  genre: genre,
  price: {
   mrp: (price.mrp / 100).toFixed(2),
   sale: (price.sale / 100).toFixed(2),
  },
  cover: cover?.url,
  rating: averageRating?.toFixed(1),
 };
};
