import express from "express";
import {
  countEstablishmentsByStatus,
  countEtablissementsThisWeek,
  createEtablissementFromRequest,
  createEstablishmentRequest,
  getAllCategories,
  getEstablishmentsByStatus,
  getEstablishmentsByUserId,
  updateEstablishmentPicture,
  updateEstablishmentStatus,
} from "../controller/EtablissementController.js";

const router = express.Router();

router.post("/request", createEstablishmentRequest);
router.post("/create-from-request", createEtablissementFromRequest);
router.get("/requests/:status", getEstablishmentsByStatus);
router.get("/by-admin/:userId", getEstablishmentsByUserId);
router.put("/update/request-status", updateEstablishmentStatus);
router.get("/categories", getAllCategories);
router.get("/count/:status", countEstablishmentsByStatus);
router.get("/count", countEtablissementsThisWeek);

export default router;
