import express from "express";
import tours from "./tours";
import users from "./users";

const router = express.Router();

export default (): express.Router => {
  tours(router);
  users(router);
  return router;
};
