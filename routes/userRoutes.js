const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");

router.post("/email-password-register", controller.emailPasswordRegister);
router.post("/login", controller.authentificate);

module.exports = router;
