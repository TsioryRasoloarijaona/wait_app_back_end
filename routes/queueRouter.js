//Moi

const express = require("express");
const router = express.Router();
const controller = require("../controller/WaitListController");

router.get('/active/:etablissementId', controller.getActiveWaitList);
router.post("/join-WaitList", controller.joinWaitList);
router.get('/position/:userId/:etablissementId', controller.getUserPosition);
router.get('/waitlist/:etablissementId', controller.getWaitListByEtablissement);
router.delete('/remove/:userId/:etablissementId', controller.removeFromWaitList);


module.exports = router;
