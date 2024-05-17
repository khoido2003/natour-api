import express from "express";

export default (router: express.Router) => {
  router.route("/signup").post();
  router.route("/login").post();
  router.route("/logout").post();
};
