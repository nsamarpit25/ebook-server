import { RequestHandler } from "express";

import crypto from "crypto";
import "dotenv/config";
import userModel from "../models/user.model";
import VerificationTokenModel from "../models/verificationToken.model";
import { formatUserProfile, sendErrorResponse } from "../utils/helper";
import mail from "../utils/mail";

import { updateAvatarToCloudinary } from "@/utils/fileUpload";
import jwt from "jsonwebtoken";

export const generateAuthLink: RequestHandler = async (req, res) => {
  // generate authentication link
  // send that link to the user

  const { email } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    //crete new user
    user = await userModel.create({ email });
  }

  const userId = user._id.toString();

  // if we already have token for the user it will remove that first
  await VerificationTokenModel.findOneAndDelete({ userId });

  const randomToken = crypto.randomBytes(36).toString("hex");

  await VerificationTokenModel.create<{ userId: string }>({
    userId,
    token: randomToken,
  });

  const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`;

  await mail.sendVerificationMail({
    link,
    to: user.email,
  });

  res.json({
    message: "Please check your email for link.",
  });
};

export const verifyAuthToken: RequestHandler = async (req, res) => {
  const { token, userId } = req.query;

  if (typeof token !== "string" || typeof userId !== "string") {
    return sendErrorResponse({
      status: 403,
      message: "Invalid Request",
      res,
    });
  }
  const verificationToken = await VerificationTokenModel.findOne({ userId });

  if (!verificationToken || !verificationToken.compare(token)) {
    return sendErrorResponse({
      status: 403,
      message: "Invalid Request, token mismatch",
      res,
    });
  }

  const user = await userModel.findById(userId);
  if (!user) {
    return sendErrorResponse({
      status: 500,
      message: "Something went wrong, user not found!",
      res,
    });
  }

  await VerificationTokenModel.findByIdAndDelete(verificationToken._id);

  const payload = { userId: user._id };

  const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });

  const isDevModeOn = process.env.NODE_ENV === "development";
  res.cookie("authToken", authToken, {
    httpOnly: true,
    secure: !isDevModeOn,
    sameSite: isDevModeOn ? "strict" : "none",
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });

  res.redirect(
    `${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(
      formatUserProfile(user)
    )}`
  );

  // res.send();
};

export const sendProfileInfo: RequestHandler = (req, res) => {
  res.send({ profile: req.user });
};

export const logout: RequestHandler = (req, res) => {
  res.clearCookie("authToken").send();
};

export const updateProfile: RequestHandler = async (req, res) => {
  const user = await userModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      signedUp: true,
    },
    { new: true }
  );

  if (!user) {
    return sendErrorResponse({
      res,
      status: 500,
      message: "Something went wrong user not found",
    });
  }

  // if there is a file add new file and update its url to the database
  const file = req.files.avatar;
  if (file && !Array.isArray(file)) {
    const avatar = await updateAvatarToCloudinary(file, user.avatar?.id);
    user.avatar = avatar;

    await user.save();
  }

  res.json({ profile: formatUserProfile(user) });
};
