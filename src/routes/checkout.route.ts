import { isAuth } from "../middlewares/isAuth";
import { checkout, instantCheckout } from "../controllers/checkout.controller";
import { Router } from "express";

const router = Router();

router.post("/", isAuth, checkout);
router.post("/instant", isAuth, instantCheckout);

export default router;
