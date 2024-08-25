import { cartItemsSchema, validate } from "@/middlewares/validator";
import { clearCart, getCart, updateCart } from "../controllers/cart.controller";
import { isAuth } from "../middlewares/isAuth";
import { Router } from "express";

const cartRouter = Router();

cartRouter.post("/", isAuth, validate(cartItemsSchema), updateCart);
cartRouter.get("/", isAuth, getCart);
cartRouter.post("/clear", isAuth, clearCart);

export default cartRouter;
