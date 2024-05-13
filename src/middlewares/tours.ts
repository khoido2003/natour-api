import express from "express";

export const aliasTopTours = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};
