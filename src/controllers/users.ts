import express from "express";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "db/users";

const signToken = (id: string) => {
  return jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  res: express.Response
) => {
  // Create new token
  const token = signToken(user._id);

  // setup cookies options
  const cookieOptions = {
    expires: new Date(
      Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
};
