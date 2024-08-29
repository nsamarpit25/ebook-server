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
  UploadBookToLocalDir,
  uploadCoverToCloudinary,
} from "../utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "../utils/helper";

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
  } = body;

  const { cover, book } = files;

  const newBook = new BookModel<BookDoc>({
    // ...body,
    price,
    description,
    fileInfo: {
      size: formatFileSize(fileInfo.size),
      id: "",
    },
    genre,
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

  if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
    newBook.cover = await uploadCoverToCloudinary(cover);
  }
  const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
    replacement: "-",
    lower: true,
  });

  if (uploadMethod === "local") {
    if (
      !book ||
      Array.isArray(book) ||
      book.mimetype !== "application/epub+zip"
    ) {
      return sendErrorResponse({
        status: 422,
        message: "Invalid book file",
        res,
      });
    }

    UploadBookToLocalDir(book, uniqueFileName);
    newBook.fileInfo.id = uniqueFileName;
  }

  newBook.fileInfo.id = uniqueFileName;

  await AuthorModel.findByIdAndUpdate(user.authorId, {
    $push: { books: newBook._id },
  });
  await newBook.save();
  res.send();
};

export const updateBook: UpdateBookRequestHandler = async (req, res) => {
  const { files, body, user } = req;
  console.log(files, body, user);
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
  } = body;

  const { cover, book: newBookFile } = files;

  const book = await BookModel.findOne({ slug, author: user.authorId });

  if (!book) {
    return sendErrorResponse({
      status: 404,
      message: "Book not found",
      res,
    });
  }

  book.description = description;
  book.genre = genre;
  book.language = language;
  book.publicationName = publicationName;
  book.publishedAt = publishedAt;
  book.title = title;
  book.price = price;

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

    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
      if (book.cover?.id) {
        await cloudinary.uploader.destroy(book.cover.id);
      }
      book.cover = await uploadCoverToCloudinary(cover);
    }
  }

  await book.save();

  res.send();
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
  } = book;

  res.json({
    book: {
      id: _id,
      title,
      genre,
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

  res.json({
    settings,
    url: `${process.env.BOOK_API_URL}/${book.fileInfo.id}`,
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
  averageRatings?: number;
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
        averageRatings: { $avg: "$reviews.rating" },
      },
    },
    {
      $sort: { averageRatings: -1 },
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
        averageRatings: 1,
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
    rating: book.averageRatings?.toFixed(1),
  }));

  res.json(result);
};
