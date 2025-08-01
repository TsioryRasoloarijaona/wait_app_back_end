import express from "express";
const router = express.Router();
import {
  getTotalWaitingList,
  insertWaitList,
  updateLine,
  getWaitListByEstablishment
} from "../controller/WaitListController.js";

//router.post('',controller.getTotalWaitingList)

router.post("/join", insertWaitList);
router.get("/list/:establishmentId" , getWaitListByEstablishment)
export default router;
