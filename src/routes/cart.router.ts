import { updateCart } from "../controllers/cart.controller";
import { isAuth } from "../middlewares/isAuth";
import { Router } from "express";

const cartRouter = Router();

cartRouter.post('/', isAuth, updateCart)

export default cartRouter;
