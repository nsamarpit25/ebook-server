import AuthorModel from "@/models/author.model";
import { Types } from "mongoose";
import path from "path";
import slugify from "slugify";
import BookModel, { BookDoc } from "../models/book.model";
import { CreateBookRequestHandler, UpdateBookRequestHandler } from "../types";
import {
  UploadBookToLocalDir,
  uploadCoverToCloudinary,
} from "../utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "../utils/helper";
import fs from "fs";
import cloudinary from "@/cloud/cloudinary";

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
        size: formatFileSize(fileInfo?.size ?? newBookFile.size)
      }
    }


    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {

      if(book.cover?.id){
        await cloudinary.uploader.destroy(book.cover.id)
      }
      book.cover = await uploadCoverToCloudinary(cover);
    }
  }


  await book.save();

  res.send();
};
