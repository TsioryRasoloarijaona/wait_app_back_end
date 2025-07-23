//Moi

const express = require("express");
const router = express.Router();
const controller = require("../controller/EtablissementController");

// Route pour créer une demande d’établissement
router.post("/request", controller.createEtablissementRequest);
router.post('/create', controller.createEtablissement);
router.get("/requests", controller.getAllRequests);
router.get("/all", controller.getAllEtablissements);
router.put("/request/status", controller.updateEtabRequestStatus);
router.post("/create-from-request", controller.createEtablissementFromRequest);
router.get("/by-user/:userId", controller.getEtablissementsByUserId);
router.get("/dashboard/:etablissementId", controller.getDashboardEtablissement);


module.exports = router;
