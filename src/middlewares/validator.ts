import { RequestHandler } from "express";
import { z, ZodRawShape, ZodType } from "zod";

export const emailValidationSchema = z.object({
  email: z
    .string({
      required_error: "Email address is required",
    })
    .email("Zod says it is invalid email"),
});

export const newUserSchema = z.object({
  name: z
    .string({
      required_error: "Name is missing",
      invalid_type_error: "Invalid name!",
    })
    .min(3, "Name must be three characters long")
    .trim(),
});

export const newAuthorSchema = z.object({
  name: z
    .string({
      required_error: "Name is missing!",
      invalid_type_error: "Invalid name!",
    })
    .trim()
    .min(3, "Invalid name"),
  about: z
    .string({
      required_error: "About is missing!",
      invalid_type_error: "Invalid about!",
    })
    .trim()
    .min(100, "Please write at least 100 characters about yourself!"),
  socialLinks: z
    .array(z.string().url("Social links can only be list of  valid URLs!"))
    .optional(),
});

export const validate = <T extends unknown>(
  schema: ZodType<T>
): RequestHandler => {
  return (req, res, next) => {
    // const schema = schema;
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
