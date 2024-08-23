import { UserDoc } from "../models/user.model";
import { Response } from "express";

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

export const formatUserProfile = (user: UserDoc) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
