const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");

//Moi
//const Queuecontroller = require("../controller/WaitListController");


router.post("/email-password-register", controller.emailPasswordRegister);
router.post("/login", controller.authentificate);
router.post("/authentificate-with-id-token", controller.authentificateWithIdToken);

//MOI
//router.post("/joinWaitList", Queuecontroller.joinWaitList);

module.exports = router;