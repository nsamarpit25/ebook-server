import { getAuthorDetails, registerAuthor } from "../controllers/author.controller";
import { isAuth } from "../middlewares/isAuth";
import { newAuthorSchema, validate } from "../middlewares/validator";
import { Router } from "express";

const authorRouter = Router();

authorRouter.post(
  "/register",
  isAuth,
  validate(newAuthorSchema),
  registerAuthor
);

authorRouter.get("/:slug", getAuthorDetails);

export default authorRouter;
