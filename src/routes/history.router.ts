import { addHistory } from "../controllers/history.controller";
import { Router } from "express";

const historyRouter = Router();

historyRouter.post("/", addHistory);

export default historyRouter;
