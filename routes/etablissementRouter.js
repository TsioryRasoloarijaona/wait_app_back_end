import express from "express";
import {
  countEtablissementsByStatus,
  countEtablissementsThisWeek,
  createEtablissementFromRequest,
  createEtablissementRequest,
  getAllCategories,
  getEstablishmentsByStatus,
  getEtablissementsByUserId,
  updateEstablishmentPicture,
  updateEtabRequestStatus,
} from "../controller/EtablissementController.js";

const router = express.Router();

router.post("/request", createEtablissementRequest);
router.post("/create-from-request", createEtablissementFromRequest);
router.get("/requests/:status", getEstablishmentsByStatus);
router.get("/by-admin/:userId", getEtablissementsByUserId);
router.put("/update/request-status", updateEtabRequestStatus);
router.get("/categories", getAllCategories);
router.get("/count/:status", countEtablissementsByStatus);
router.get("/count", countEtablissementsThisWeek);

export default router;
