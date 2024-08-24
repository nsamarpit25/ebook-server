import { getAuthorDetails, registerAuthor, updateAuthor } from "../controllers/author.controller";
import { isAuth, isAuthor } from "../middlewares/isAuth";
import { newAuthorSchema, validate } from "../middlewares/validator";
import { Router } from "express";

const authorRouter = Router();

authorRouter.post(
  "/register",
  isAuth,
  validate(newAuthorSchema),
  registerAuthor
);
authorRouter.patch(
  "/",
  isAuth,
  isAuthor,
  validate(newAuthorSchema),
  updateAuthor
);

authorRouter.get("/:slug", getAuthorDetails);

export default authorRouter;
