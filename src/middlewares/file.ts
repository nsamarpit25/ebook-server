import { RequestHandler } from "express";
import formidable, { File } from "formidable";

declare global {
  namespace Express {
    export interface Request {
      //   files: { [key: string]: File | File[] };
      files: Record<string, File | File[] | undefined>;
    }
  }
}

export const fileParser: RequestHandler = async (req, res, next) => {
  const form = formidable();
  const [fields, files] = await form.parse(req);

  if (!req.body) req.body = {};
  if (!req.files) req.files = {};

  for (const key in fields) {
    const fieldValue = fields[key];
    if (fieldValue) req.body[key] = fieldValue[0];
  }

  for (const key in files) {
    const fieldValue = files[key];
    if (fieldValue) {
      if (fieldValue.length > 1) {
        req.files[key] = fieldValue;
      } else {
        req.files[key] = fieldValue[0];
      }
    }
  }
  next();
};
