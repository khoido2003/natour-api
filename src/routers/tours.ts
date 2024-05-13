import express from "express";

export default (router: express.Router) => {
  router.route("/api/v1/tours").get();
};
