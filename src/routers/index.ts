import express from "express";
import tours from "./tours";

const router = express.Router();

export default (): express.Router => {
  tours(router);
  return router;
};
