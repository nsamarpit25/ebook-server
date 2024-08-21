import { Router } from "express";
import { generateAuthLink } from "../controllers/auth";
import { emailValidationSchema, validate } from "../middlewares/validator";

const authRouter = Router();

authRouter.post(
  "/generate-link",
  validate(emailValidationSchema),
  generateAuthLink
);

export default authRouter;

// using custom validator
// const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
// if (!regex.test(email)) {
//   // send error response in case email is not valid
//   return res.status(422).json({ error: "Invalid email!" });
//   // 422 :- unprocessable entity
// }
