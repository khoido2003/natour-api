import { login, signUp } from "../controllers/users";
import express from "express";

export default (router: express.Router) => {
  router.route("/signup").post(signUp);
  router.route("/login").post(login);
  // router.route("/logout").post();
};
