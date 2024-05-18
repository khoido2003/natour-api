import { aliasTopTours } from "../middlewares/tours";
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
} from "../controllers/tours";
import express from "express";
import { protect, restrictTo } from "../controllers/users";

export default (router: express.Router) => {
  router.route("/top-5-tours").get(aliasTopTours, getAllTours);
  router
    .route("/tours")
    .post(createTour)
    .get(protect, restrictTo("user"), getAllTours);
  router.route("/tours/:id").get(getTour).delete(deleteTour);
};
