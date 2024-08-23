import jwt from "jsonwebtoken";
import { formatUserProfile, sendErrorResponse } from "../utils/helper";
import { RequestHandler } from "express-serve-static-core";
import userModel from "../models/user.model";

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
        name?: string;
        email: string;
        role: "user" | "author";
        avatar?: string;
      };
    }
  }
}

export const isAuth: RequestHandler = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    return sendErrorResponse({
      status: 401,
      message: "Unauthorized request",
      res,
    });
  }
  const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
    userId: string;
  };

  const user = await userModel.findById(payload.userId);

  if (!user) {
    return sendErrorResponse({
      status: 401,
      message: "Unauthorized request user not found",
      res,
    });
  }

  req.user = formatUserProfile(user);
  next();
};
