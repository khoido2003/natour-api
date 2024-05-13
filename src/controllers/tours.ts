import APIFeatures from "../helpers/apiFeatures";
import {
  createTourFn,
  deleteTourByIdFn,
  getAllTourFn,
  getTourByIdFn,
} from "../db/tours";
import express from "express";

// Create one tour
export const createTour = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const tour = await createTourFn(req.body);

    return res.status(201).json(tour).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

// Get one tour
export const getTour = async (req: express.Request, res: express.Response) => {
  try {
    const tour = await getTourByIdFn(req.params.id);

    return res.status(200).json(tour).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

// Get all tour with conditions from query string
export const getAllTours = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // const tours = await getAllTourFn();

    const features = new APIFeatures(getAllTourFn(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    return res.status(200).json(tours).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

// Delete one tour
export const deleteTour = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const tour = await deleteTourByIdFn(req.params.id);

    return res.status(200).json(tour).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};
