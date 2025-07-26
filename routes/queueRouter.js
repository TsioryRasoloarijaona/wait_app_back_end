//Moi

const express = require("express");
const router = express.Router();
const controller = require("../controller/WaitListController");

router.get('/active/:establishmentId', controller.getActiveWaitList);
router.post("/join-WaitList", controller.joinWaitList);
router.get('/position/:userId/:establishmentId', controller.getUserPosition);
router.get('/waitlist/:establishmentId', controller.getWaitListByEtablissement);
router.delete('/remove/:userId/:establishmentId', controller.removeFromWaitList);


module.exports = router;
