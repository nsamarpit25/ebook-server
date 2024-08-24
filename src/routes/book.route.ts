import {
  newBookSchema,
  updateBookSchema,
  validate,
} from "../middlewares/validator";
import { fileParser } from "../middlewares/file";
import { isAuth, isAuthor } from "../middlewares/isAuth";
import { Router } from "express";
import { createNewBook, updateBook } from "../controllers/book.controller";

const bookRouter = Router();

bookRouter.post(
  "/create",
  isAuth,
  isAuthor,
  fileParser,
  validate(newBookSchema),
  createNewBook
);

bookRouter.patch(
  "/",
  isAuth,
  isAuthor,
  fileParser,
  validate(updateBookSchema),
  updateBook
);

bookRouter.get('/list', isAuth, getAllBooks)

export default bookRouter;
