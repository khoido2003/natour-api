import express from "express";

import jwt from "jsonwebtoken";
import { IUser, User } from "../db/users";

interface JwtPayload {
  id: string;
  iat: number;
}

interface AuthRequest extends express.Request {
  user: IUser;
}

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

  res
    .status(statusCode)
    .json({
      status: "success",
      token: token,
      data: {
        user: user,
      },
    })
    .end();
};

export const protect = async (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new Error("You are not logged in! Please login to get access")
      );
    }

    //2, Verification Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    //3 Check if the user is still existed
    const currentUser: IUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new Error("The user belonging to this token no longer exists!")
      );
    }

    // 4, Check if user changed password after the Jwt token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
      return next(new Error("User recently changed password!"));
    }

    // Granted accrss to the protect route
    req.user = currentUser;

    // Save the current user to the res.locals so we can access it in view routes or other templates
    res.locals.user = currentUser;

    return next();
  } catch (err) {
    console.log(err);
    console.log("error");
  }
};

export const signUp = async (req: express.Request, res: express.Response) => {
  try {
    const newUser = await new User({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: Date.now(),
    }).save();

    res
      .status(200)
      .json({
        message: "success",
        data: newUser,
      })
      .end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

export const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password } = req.body;

    // 1, Check if email and password exists
    if (!email || !password) {
      return next(new Error("Please enter a valid email and password"));
    }

    // 2, Check if user exists and password is correct
    const user: IUser = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new Error("Incorrect email or password"));
    }

    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

export const restrictTo =
  (...roles: string[]) =>
  (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You do not have permission to perform this action")
      );
    }

    next();
  };
