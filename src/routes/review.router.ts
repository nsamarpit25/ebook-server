import { newReviewSchema, validate } from "../middlewares/validator";
import { addReview, getPublicReviews, getReview } from "../controllers/review.controller";
import { isAuth, isPurchasedByUser } from "../middlewares/isAuth";
import { Router } from "express";

const reviewRouter = Router();

reviewRouter.post(
  "/",
  isAuth,
  validate(newReviewSchema),
  // --- check if authenticated user purchased the course
  isPurchasedByUser,
  addReview
);

reviewRouter.get("/:bookId", isAuth, getReview);
reviewRouter.get("/list/:bookId", getPublicReviews);

export default reviewRouter;
