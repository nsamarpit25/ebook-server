import { Router } from "express";
import {
  generateAuthLink,
  logout,
  sendProfileInfo,
  updateProfile,
  verifyAuthToken,
} from "../controllers/auth.controller";
import {
  emailValidationSchema,
  newUserSchema,
  validate,
} from "../middlewares/validator";
import { isAuth } from "../middlewares/isAuth";
import { fileParser } from "@/middlewares/file";

const authRouter = Router();

authRouter.post(
  "/generate-link",
  validate(emailValidationSchema),
  generateAuthLink
);

authRouter.get("/verify", verifyAuthToken);
authRouter.get("/profile", isAuth, sendProfileInfo);
authRouter.post("/logout", isAuth, logout);
authRouter.put(
  "/profile",
  isAuth,
  fileParser,
  validate(newUserSchema),
  updateProfile
);

export default authRouter;

// using custom validator
// const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
// if (!regex.test(email)) {
//   // send error response in case email is not valid
//   return res.status(422).json({ error: "Invalid email!" });
//   // 422 :- unprocessable entity
// }
