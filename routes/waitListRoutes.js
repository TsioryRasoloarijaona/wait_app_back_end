const express = require("express");
const router = express.Router();
const controller = require("../controller/WaitListController");

//router.post('',controller.getTotalWaitingList)

router.post("/join", controller.insertWaitList);
module.exports = router;
