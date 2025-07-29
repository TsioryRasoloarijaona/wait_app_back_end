const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");

router.post("/email-password-register", controller.emailPasswordRegister);
router.post("/login", controller.authentificate);
router.post(
  "/authentificate-with-id-token",
  controller.authentificateWithIdToken
);

router.get("/:id" , controller.userInfo)

module.exports = router;
