import { RequestHandler } from "express";

import crypto from "crypto";

export const generateAuthLink: RequestHandler = (req, res) => {
  // generate authentication link
  // send that link to the user

  const randomToken = crypto.randomBytes(36).toString("hex");

  console.log(req.body);
  res.json({
    ok: true,
  });
};
