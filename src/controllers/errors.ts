import express from "express";

export const errorController = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  return res
    .status(500)
    .json({
      status: "error",
      message: err.message,
    })
    .end();
};
