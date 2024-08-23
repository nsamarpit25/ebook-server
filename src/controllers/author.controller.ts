import { sendErrorResponse } from "@/utils/helper";
import { RequestAuthorHandler } from "../types/index";
import AuthorModel from "@/models/author.model";
import slugify from "slugify";
import userModel from "@/models/user.model";
import { RequestHandler } from "express";

export const registerAuthor: RequestAuthorHandler = async (req, res) => {
  const { body, user } = req;
  console.log(body, user);
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

  res.json({ messsage: "Thanks for registering as an author." });
};

export const getAuthorDetails: RequestHandler = async (req, res) => {
  const { slug } = req.params;
  const author = await AuthorModel.findOne({
    slug,
  });

  if (!author) {
    return sendErrorResponse({
      status: 404,
      message: "Author not found",
      res,
    });
  }

  res.json({
    id: author._id,
    name: author.name,
    about: author.about,
    socialLinks: author.socialLinks
    
  });
};
