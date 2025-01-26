import { sendErrorResponse } from "@/utils/helper";
import { RequestAuthorHandler } from "../types/index";
import AuthorModel from "@/models/author.model";
import slugify from "slugify";
import userModel, { UserDoc } from "@/models/user.model";
import { RequestHandler } from "express";
import { BookDoc } from "@/models/book.model";

export const registerAuthor: RequestAuthorHandler = async (req, res) => {
 const { body, user } = req;
 if (!user.signedUp) {
  return sendErrorResponse({
   message: "User must be signed up before registering as an author!!",
   res,
   status: 401,
  });
 }

 const newAuthor = new AuthorModel({
  name: body.name,
  about: body.about,
  userId: user.id,
  socialLinks: body.socialLinks,
 });

 const uniqueSlug = slugify(`${newAuthor.name} ${newAuthor._id}`, {
  lower: true,
  replacement: "-",
 });

 newAuthor.slug = uniqueSlug;
 await newAuthor.save();

 await userModel.findByIdAndUpdate(user.id, {
  authorId: newAuthor._id,
  role: "author",
 });

 res.json({ message: "Thanks for registering as an author." });
};

export const getAuthorDetails: RequestHandler = async (req, res) => {
 const { id } = req.params;

 const author = await AuthorModel.findById(id)
  .populate<{ userId: UserDoc }>("userId")
  .populate<{ books: BookDoc[] }>("books");
 // console.log(author);
 if (!author)
  return sendErrorResponse({
   res,
   message: "Author not found!",
   status: 404,
  });

 let avatar = "";
 if (author.userId?.avatar?.url) {
  avatar = author.userId.avatar?.url;
 }

 res.json({
  id: author._id,
  name: author.name,
  about: author.about,
  socialLinks: author.socialLinks,
  avatar,
  books: author.books?.map((book) => {
   return {
    id: book._id?.toString(),
    title: book.title,
    slug: book.slug,
    genre: book.genre,
    price: {
     mrp: (book.price.mrp / 100).toFixed(2),
     sale: (book.price.sale / 100).toFixed(2),
    },
    cover: book.cover?.url,
    rating: book.averageRating?.toFixed(1),
   };
  }),
 });
};

export const updateAuthor: RequestAuthorHandler = async (req, res) => {
 const { body, user } = req;

 await AuthorModel.findByIdAndUpdate(user.authorId, {
  name: body.name,
  about: body.about,
  socialLinks: body.socialLinks,
 });

 res.json({ message: "Your details have been updated successfully." });
};
