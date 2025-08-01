import express from "express";
import {
  authentificate,
  authentificateWithIdToken,
  emailPasswordRegister,
  getByUserId,
  userInfo,
  userAccounts
} from "../controller/userController.js";
const router = express.Router();

router.post("/email-password-register", emailPasswordRegister);
router.post("/login", authentificate);
router.post("/authentificate-with-id-token", authentificateWithIdToken);
router.get("/accounts/:id" , userAccounts )

router.get("/:id", userInfo);
export default router;
