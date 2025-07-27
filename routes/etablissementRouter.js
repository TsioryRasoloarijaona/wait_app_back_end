const express = require("express");
const router = express.Router();
const controller = require("../controller/EtablissementController");
router.post("/request", controller.createEtablissementRequest);
router.post("/create-from-request", controller.createEtablissementFromRequest);
router.get("/requests/:status", controller.getEstablishmentsByStatus);
router.get("/by-user/:userId", controller.getEtablissementsByUserId);
router.put("/update/request-status" , controller.updateEtabRequestStatus)

module.exports = router;
