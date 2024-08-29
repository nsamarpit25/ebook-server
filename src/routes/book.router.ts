import { Router } from "express";
import {
  createNewBook,
  generateBookAccessUrl,
  getAllPurchasedBooks,
  getBookByGenre,
  getBooksPublicDetails,
  getRecommendedBooks,
  updateBook
} from "../controllers/book.controller";
import { fileParser } from "../middlewares/file";
import { isAuth, isAuthor } from "../middlewares/isAuth";
import {
  newBookSchema,
  updateBookSchema,
  validate,
} from "../middlewares/validator";

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

bookRouter.get("/list", isAuth, getAllPurchasedBooks);
bookRouter.get("/details/:slug", getBooksPublicDetails);
bookRouter.get("/by-genre/:genre", getBookByGenre);
bookRouter.get("/read/:slug", isAuth, generateBookAccessUrl);
bookRouter.get("/recommended/:bookId",  getRecommendedBooks);

export default bookRouter;
