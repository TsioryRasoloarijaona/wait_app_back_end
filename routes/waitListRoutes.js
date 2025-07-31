import express from "express";
const router = express.Router();
import {
  getTotalWaitingList,
  insertWaitList,
  updateLine,
} from "../controller/WaitListController.js";

//router.post('',controller.getTotalWaitingList)

router.post("/join", insertWaitList);
export default router;
