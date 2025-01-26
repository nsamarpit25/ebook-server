import jwt from "jsonwebtoken";
import { formatUserProfile, sendErrorResponse } from "../utils/helper";
import { RequestHandler } from "express-serve-static-core";
import userModel from "../models/user.model";
import { AddReviewRequestHandler, IsPurchasedByTheUserHandler } from "../types";
import BookModel from "@/models/book.model";

declare global {
 namespace Express {
  export interface Request {
   user: {
    id: string;
    name?: string;
    email: string;
    role: "user" | "author";
    avatar?: string;
    signedUp: Boolean;
    authorId?: string;
    books?: string[];
   };
  }
 }
}

export const isAuth: RequestHandler = async (req, res, next) => {
 let authToken = req.cookies.authToken;

 const customFieldIndex = req.rawHeaders.findIndex(
  (header, index) => header.toLowerCase() === "react-token" && index % 2 === 0
 );
 const customField =
  customFieldIndex !== -1 ? req.rawHeaders[customFieldIndex + 1] : null;

 let token = authToken ? customField?.split("=")[1] : null;
 //  console.log(token);

 if (token && token.endsWith('"')) {
  token = token.slice(0, -1); // Remove the last character (double quote)
 }

 if (!authToken) {
  authToken = token;
 }
 console.log(token);

 if (!authToken) {
  return sendErrorResponse({
   status: 401,
   message: "Unauthorized request",
   res,
  });
 }

 const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
  userId: string;
 };

 const user = await userModel.findById(payload.userId);

 if (!user) {
  return sendErrorResponse({
   status: 401,
   message: "Unauthorized request user not found",
   res,
  });
 }

 req.user = formatUserProfile(user);
 next();
};

export const isAuthor: RequestHandler = (req, res, next) => {
 if (req.user.role === "author") {
  next();
 } else {
  return sendErrorResponse({
   message: "User must be author",
   res,
   status: 401,
  });
 }
};

export const isPurchasedByUser: IsPurchasedByTheUserHandler = async (
 req,
 res,
 next
) => {
 const user = await userModel.findOne({
  _id: req.user.id,
  books: req.body.bookId,
 });

 if (!user) {
  return sendErrorResponse({
   status: 403,
   message: "Sorry we didn't found the book inside your library",
   res,
  });
 }

 next();
};

export const isValidReadingRequest: RequestHandler = async (req, res, next) => {
 const url = req.url;
 const regex = new RegExp("/([^/?]+.epub)");
 const regexMatch = url.match(regex);
 if (!regexMatch) {
  return sendErrorResponse({
   status: 403,
   message: "Invalid request",
   res,
  });
 }
 const bookFileId = regexMatch[1];
 console.log(bookFileId);

 const book = await BookModel.findOne({ "fileInfo.id": bookFileId });

 if (!book) {
  return sendErrorResponse({
   status: 403,
   message: "Invalid request",
   res,
  });
 }
 const user = await userModel.findById({ _id: req.user.id, book: book._id });

 if (!user) {
  return sendErrorResponse({
   status: 403,
   message: "Unauthorized request",
   res,
  });
 }
 next();
};
