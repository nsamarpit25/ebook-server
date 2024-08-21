import { RequestHandler } from "express";

import crypto from "crypto";
import VerificationTokenModel from "../models/verificationToken";
import userModel from "../models/user";

export const generateAuthLink: RequestHandler = async (req, res) => {
  // generate authentication link
  // send that link to the user

  const { email } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    //crete new user
    user = await userModel.create({ email });
  }

  const randomToken = crypto.randomBytes(36).toString("hex");

  await VerificationTokenModel.create<{ userId: string }>({
    userId: user._id.toString(),
    token: randomToken,
  });

  console.log(req.body);
  res.json({
    ok: true,
  });
};
