const express = require("express");
const router = express.Router();
const controller = require("../controller/EtablissementController");
const { route } = require("./userRoutes");
router.post("/request", controller.createEtablissementRequest);
router.post("/create-from-request", controller.createEtablissementFromRequest);
router.get("/requests/:status", controller.getEstablishmentsByStatus);
router.get("/by-admin/:userId", controller.getEtablissementsByUserId);
router.put("/update/request-status" , controller.updateEtabRequestStatus)
router.get("/categories", controller.getAllCategories);
router.get("/count/:status", controller.countEtablissementsByStatus);
router.get("/count", controller.countEtablissementsThisWeek);

module.exports = router;
