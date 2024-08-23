import { RequestHandler } from "express";
import { z, ZodRawShape } from "zod";

export const emailValidationSchema = {
  email: z
    .string({
      required_error: "Email address is required",
    })
    .email("Zod says it is invalid email"),
};

export const newUserSchema = {
  name: z
    .string({
      required_error: "Name is missing",
      invalid_type_error: "Invalid name!",
    })
    .min(3, "Name must be three characters long")
    .trim(),
};

export const validate = <T extends ZodRawShape>(obj: T): RequestHandler => {
  return (req, res, next) => {
    const schema = z.object(obj);
    const result = schema.safeParse(req.body);

    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const errors = result.error.flatten().fieldErrors;
      return res.status(422).json({ errors });
    }
  };
};
