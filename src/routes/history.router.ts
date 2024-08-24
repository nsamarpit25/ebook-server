import { Router } from "express";
import { getBookHistory, updateBookHistory } from "../controllers/history.controller";
import { isAuth, isPurchasedByUser } from "../middlewares/isAuth";
import { historyValidationSchema, validate } from "../middlewares/validator";

const historyRouter = Router();

historyRouter.post(
  "/",
  isAuth,
  validate(historyValidationSchema),
  isPurchasedByUser,
  updateBookHistory
);

historyRouter.get('/:bookId', isAuth, getBookHistory)

export default historyRouter;
