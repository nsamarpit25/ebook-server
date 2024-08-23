import { Request, Response } from "express";
import { UserDoc } from "../models/user.model";

type ErrorResponseType = {
  status: number;
  message: string;
  res: Response;
};

export const sendErrorResponse = ({
  status,
  message,
  res,
}: ErrorResponseType) => {
  return res.status(status).json({ message });
};

export const formatUserProfile = (user: UserDoc): Request["user"] => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar?.url,
  };
};
