import express from "express";
const router = express.Router();
import {
  getTotalWaitingList,
  insertWaitList,
  updateLine,
  getWaitListByEstablishment,
  leaveWaitList,
} from "../controller/WaitListController.js";

//router.post('',controller.getTotalWaitingList)

router.post("/join", insertWaitList);
router.post("/leave", leaveWaitList); 
router.get("/list/:establishmentId" , getWaitListByEstablishment)
export default router;
