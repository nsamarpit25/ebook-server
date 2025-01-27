import userModel from "@/models/user.model";
import { RequestHandler } from "express";
import fs from "fs";
import { isValidObjectId, ObjectId, Types } from "mongoose";
import path from "path";
import slugify from "slugify";
import cloudinary from "../cloud/cloudinary";
import AuthorModel from "../models/author.model";
import BookModel, { BookDoc } from "../models/book.model";
import HistoryModel, { Settings } from "../models/history.model";
import { CreateBookRequestHandler, UpdateBookRequestHandler } from "../types";
import {
 generateFileUploadUrl,
 UploadBookToLocalDir,
 uploadCoverToCloudinary,
} from "../utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "../utils/helper";
import s3Client from "@/cloud/aws";
import {
 DeleteObjectCommand,
 GetObjectAclCommand,
 GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import bookRouter from "@/routes/book.router";

export const createNewBook: CreateBookRequestHandler = async (req, res) => {
 const { files, body, user } = req;
 const {
  price,
  description,
  fileInfo,
  genre,
  language,
  publicationName,
  publishedAt,
  title,
  uploadMethod,
  status,
 } = body;

 const { cover, book } = files;

 const newBook = new BookModel<BookDoc>({
  // ...body,
  price,
  description,
  copiesSold: 0,
  status,
  fileInfo: {
   size: formatFileSize(fileInfo.size),
   id: "",
  },
  genre: genre.toLowerCase(),
  language,
  publicationName,
  publishedAt,
  title,
  slug: "",
  author: new Types.ObjectId(user.authorId),
 });

 newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
  replacement: "-",
  lower: true,
 });

 const fileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
  replacement: "-",
  lower: true,
 });

 //  const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
 //   replacement: "-",
 //   lower: true,
 //  });

 //  if (uploadMethod === "local") {
 //   if (
 //    !book ||
 //    Array.isArray(book) ||
 //    book.mimetype !== "application/epub+zip"
 //   ) {
 //    return sendErrorResponse({
 //     status: 422,
 //     message: "Invalid book file",
 //     res,
 //    });
 //   }

 //   UploadBookToLocalDir(book, uniqueFileName);
 //   newBook.fileInfo.id = uniqueFileName;
 //  }
 let fileUploadUrl = "";

 if (uploadMethod === "aws") {
  fileUploadUrl = await generateFileUploadUrl(s3Client, {
   bucket: process.env.AWS_PRIVATE_BUCKET!,
   contentType: fileInfo.type,
   uniqueKey: fileName,
  });
 }

 if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
  newBook.cover = await uploadCoverToCloudinary(cover);
 }

 newBook.fileInfo.id = fileName;

 await AuthorModel.findByIdAndUpdate(user.authorId, {
  $push: { books: newBook._id },
 });
 await newBook.save();
 await userModel.findByIdAndUpdate(req.user.id, {
  $push: { books: newBook._id },
 });

 //  console.log(fileUploadUrl);
 res.send(fileUploadUrl);
};

export const updateBook: UpdateBookRequestHandler = async (req, res) => {
 const { files, body, user } = req;
 //   console.log(files, body, user);
 const {
  price,
  description,
  fileInfo,
  genre,
  language,
  publicationName,
  publishedAt,
  title,
  uploadMethod,
  slug,
  status,
 } = body;

 //  console.log(req);

 const { cover, book: newBookFile } = files;
 console.log(files);

 const book = await BookModel.findOne({ slug, author: user.authorId });

 if (!book) {
  return sendErrorResponse({
   status: 404,
   message: "Book not found",
   res,
  });
 }

 book.description = description;
 book.genre = genre.toLowerCase();
 book.language = language;
 book.publicationName = publicationName;
 book.publishedAt = publishedAt;
 book.title = title;
 book.price = price;
 book.status = status;

 if (uploadMethod === "local") {
  if (
   newBookFile &&
   !Array.isArray(newBookFile) &&
   newBookFile.mimetype === "application/epub+zip"
  ) {
   // remove old book file (epub) from the storage
   const uploadPath = path.join(__dirname, "../books");
   const oldFilePath = path.join(uploadPath, book.fileInfo.id);

   if (!fs.existsSync(oldFilePath)) {
    return sendErrorResponse({
     status: 404,
     message: "Book file not found",
     res,
    });
   }

   fs.unlinkSync(oldFilePath);

   const newFileName = slugify(`${book._id} ${book.title}`, {
    replacement: "-",
    lower: true,
   });

   const newFilePath = path.join(uploadPath, newFileName);
   const file = fs.readFileSync(newBookFile.filepath);
   fs.writeFileSync(newFilePath, file);

   book.fileInfo = {
    id: newFileName,
    size: formatFileSize(fileInfo?.size ?? newBookFile.size),
   };
  }
 }

 if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
  if (book.cover?.id) {
   await cloudinary.uploader.destroy(book.cover.id);
  }
  book.cover = await uploadCoverToCloudinary(cover);
 }

 let fileUploadUrl = "";

 if (uploadMethod === "aws") {
  console.log(newBookFile);
  if (
   newBookFile &&
   !Array.isArray(newBookFile) &&
   newBookFile.mimetype === "application/epub+zip"
  ) {
   console.log("here");
   // remove the old book from cloud (bucket)
   const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.AWS_PRIVATE_BUCKET,
    Key: book.fileInfo.id,
   });

   await s3Client.send(deleteCommand);

   // generate (sign) new url to upload book
   const fileName = slugify(`${book._id} ${book.title}.epub`, {
    lower: true,
    replacement: "-",
   });
   fileUploadUrl = await generateFileUploadUrl(s3Client, {
    bucket: process.env.AWS_PRIVATE_BUCKET!,
    contentType: fileInfo?.type || newBookFile.mimetype,
    uniqueKey: fileName,
   });
   book.markModified("fileInfo");
   book.fileInfo.id = fileName;
   // console.log(fileUploadUrl);
   console.log(fileName);
  }
 }
 await book.save();

 res.send(fileUploadUrl);
};

interface PopulatedBooks {
 cover?: {
  url: string;
  id: string;
 };
 _id: ObjectId;
 author: {
  _id: string;
  name: string;
  slug: string;
 };
 title: string;
 slug: string;
}

export const getAllPurchasedBooks: RequestHandler = async (req, res) => {
 const user = await userModel
  .findById(req.user.id)
  .populate<{ books: PopulatedBooks[] }>({
   path: "books",
   select: "author title cover slug",
   populate: { path: "author", select: "slug name" },
  });

 if (!user) return res.json({ books: [] });

 res.json({
  books: user?.books.map((item) => {
   return {
    id: item._id,
    title: item.title,
    cover: item.cover?.url,
    slug: item.slug,
    author: {
     id: item.author._id,
     name: item.author.name,
     slug: item.author.slug,
    },
   };
  }),
 });
};

export const getBooksPublicDetails: RequestHandler = async (req, res) => {
 const book = await BookModel.findOne({ slug: req.params.slug }).populate<{
  author: PopulatedBooks["author"];
 }>({
  path: "author",
  select: "name slug",
 });

 if (!book)
  return sendErrorResponse({
   status: 404,
   message: "Book not found!",
   res,
  });

 const {
  _id,
  title,
  cover,
  author,
  slug,
  description,
  genre,
  language,
  publishedAt,
  publicationName,
  averageRating,
  price: { mrp, sale },
  fileInfo,
  status,
 } = book;

 res.json({
  book: {
   id: _id,
   title,
   genre,
   status,
   language,
   slug,
   description,
   publicationName,
   fileInfo,
   publishedAt: publishedAt.toISOString().split("T")[0],
   cover: cover?.url,
   rating: averageRating?.toFixed(2),
   price: {
    mrp: (mrp / 100).toFixed(2), // $1 100C/100 = $1
    sale: (sale / 100).toFixed(2), // 1.50
   },
   author: {
    id: author._id,
    name: author.name,
    slug: author.slug,
   },
  },
 });
};

export const getBookByGenre: RequestHandler = async (req, res) => {
 const books = await BookModel.find({
  genre: req.params.genre.toLowerCase(),
 }).limit(5);

 res.json({
  books: books.map((book) => {
   const {
    status,
    _id,
    title,
    cover,
    averageRating,
    slug,
    genre,
    price: { mrp, sale },
   } = book;
   return {
    id: _id,
    title,
    genre,
    slug,
    cover: cover?.url,
    rating: averageRating?.toFixed(1),
    price: {
     mrp: (mrp / 100).toFixed(2), // $1 100C/100 = $1
     sale: (sale / 100).toFixed(2), // 1.50
    },
   };
  }),
 });
};

export const generateBookAccessUrl: RequestHandler = async (req, res) => {
 const { slug } = req.params;

 const book = await BookModel.findOne({ slug });
 if (!book)
  return sendErrorResponse({
   status: 404,
   message: "Book not found!",
   res,
  });

 //  if (req.user.authorId) {
 //   if (book.author.toString() === req.user.authorId) {
 //    const getCommand = new GetObjectCommand({
 //     Bucket: process.env.AWS_PRIVATE_BUCKET!,
 //     Key: book.fileInfo.id,
 //    });

 //    // console.log(book.fileInfo.id);

 //    const accessUrl = await getSignedUrl(s3Client, getCommand);
 //    return res.json({
 //     settings: { lastLocation: "", highlights: [{ selection: "", fill: "" }] },
 //     url: accessUrl,
 //    });
 //   }
 //  }

 const user = await userModel.findOne({ books: book._id, _id: req.user.id });
 if (!user)
  return sendErrorResponse({
   status: 404,
   message: "User not found!",
   res,
  });

 const history = await HistoryModel.findOne({
  reader: user._id,
  book: book._id,
 });

 const settings: Settings = {
  lastLocation: "",
  highlights: [{ selection: "", fill: "" }],
 };

 if (history) {
  settings.highlights = history.highlights.map((h) => {
   return { fill: h.fill, selection: h.selection };
  });
  settings.lastLocation = history.lastLocation;
 }

 const getCommand = new GetObjectCommand({
  Bucket: process.env.AWS_PRIVATE_BUCKET!,
  Key: book.fileInfo.id,
 });

 console.log(book.fileInfo.id);

 const accessUrl = await getSignedUrl(s3Client, getCommand);
 res.json({
  settings,
  url: accessUrl,
 });
};

interface RecommendedBooks {
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

export interface AggregationResult {
 _id: ObjectId;
 title: string;
 genre: string;
 price: {
  mrp: number;
  sale: number;
  _id: ObjectId;
 };
 cover?: {
  url: string;
  id: string;
  _id: ObjectId;
 };
 slug: string;
 averageRating?: number;
}

export const getRecommendedBooks: RequestHandler = async (req, res) => {
 const { bookId } = req.params;

 if (!isValidObjectId(bookId)) {
  return sendErrorResponse({ message: "Invalid book id!", res, status: 422 });
 }

 const book = await BookModel.findById(bookId);
 if (!book) {
  return sendErrorResponse({ message: "Book not found!", res, status: 404 });
 }

 const recommendedBooks = await BookModel.aggregate<AggregationResult>([
  { $match: { genre: book.genre, _id: { $ne: book._id } } },
  {
   $lookup: {
    localField: "_id",
    from: "reviews",
    foreignField: "book",
    as: "reviews",
   },
  },
  {
   $addFields: {
    averageRating: { $avg: "$reviews.rating" },
   },
  },
  {
   $sort: { averageRating: -1 },
  },
  {
   $limit: 5,
  },
  {
   $project: {
    _id: 1,
    title: 1,
    slug: 1,
    genre: 1,
    price: 1,
    cover: 1,
    averageRating: 1,
   },
  },
 ]);

 const result = recommendedBooks.map<RecommendedBooks>((book) => ({
  id: book._id.toString(),
  title: book.title,
  slug: book.slug,
  genre: book.genre,
  price: {
   mrp: (book.price.mrp / 100).toFixed(2),
   sale: (book.price.sale / 100).toFixed(2),
  },
  cover: book.cover?.url,
  rating: book.averageRating?.toFixed(1),
 }));

 res.json(result);
};

export const deleteBook: RequestHandler = async (req, res) => {
 const { bookId } = req.params;
 const deleteMethodAddedDate = 1737942815856;

 if (!isValidObjectId(bookId)) {
  return sendErrorResponse({ message: "Invalid book id!", res, status: 422 });
 }

 const book = await BookModel.findById({
  _id: bookId,
  author: req.user.authorId,
 }); // .populate("author");

 if (!book) {
  return sendErrorResponse({ message: "Book not found!", res, status: 404 });
 }

 const bookCreationTime = book._id.getTimestamp().getTime();
 if (bookCreationTime <= deleteMethodAddedDate) {
  return res.json({ success: false });
 }

 if (book.copiesSold > 0) {
  return res.json({
   success: false,
   message: "Book has been sold, cannot delete",
  });
 }
 // remove the book from the author's books array
 await BookModel.findByIdAndDelete(book._id);

 const author = await AuthorModel.findById(req.user.authorId);

 if (author) {
  author.books = author.books.filter(
   (id) => id.toString() !== book._id.toString()
  );
  await author.save();
 }

 const coverId = book.cover?.id;
 const bookFileId = book.fileInfo.id;
 if (coverId) {
  await cloudinary.uploader.destroy(coverId);
 }

 if (bookFileId) {
  const deleteCommand = new DeleteObjectCommand({
   Bucket: process.env.AWS_PRIVATE_BUCKET!,
   Key: bookFileId,
  });
  await s3Client.send(deleteCommand);
 }

 res.send({ success: true });
};
