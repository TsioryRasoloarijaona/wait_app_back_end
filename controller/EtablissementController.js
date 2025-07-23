//Moi

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createEtablissementRequest = async (req, res) => {
  try {
    const { userId, etablissementName } = req.body;

    //Vérifie si le userId et le nom de l'établissement à créer sont donnés
    if (!userId || !etablissementName) {
      return res.status(400).json({ error: "userId et nom de l'etablissement sont requis" });
    }

    //Vérifie si l'utilisateur existe
    const user = await prisma.users.findUnique({
    where: { id: userId }
    });

    if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
    }


    // Vérifie si une demande sur le même établissement est déjà en attente
    const existing = await prisma.etablissementRequest.findFirst({
      where: {
        userId,
        etablissementName,
        status: "pending" },
    });

    if (existing) {
      return res.status(400).json({ error: "Une demande est déjà en attente." });
    }

    const newRequest = await prisma.etablissementRequest.create({
      data: { userId, etablissementName },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Erreur lors de la création de la demande :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Si le SuperAdmin veux créer lui-même un établissement
const createEtablissement = async (req, res) => {
  try {
    const { userId, name, secteur, address, ville } = req.body;

    if (!userId || !name || !secteur || !address || !ville) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    // Créer l'établissement lié à cet utilisateur
    const newEtablissement = await prisma.etablissement.create({
      data: {
        userId,
        name,
        secteur,
        address,
        ville,
      },
    });

    res.status(201).json(newEtablissement);
  } catch (error) {
    console.error("Erreur lors de la création de l'établissement :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Voir tous les demandes
const getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.etablissementRequest.findMany();
    res.status(200).json(requests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Voir tous les établissements
const getAllEtablissements = async (req, res) => {
  try {
    const etablissements = await prisma.etablissement.findMany({
      include: {
        waitingList: true, // inclure les personnes en file
      },
    });
    res.status(200).json(etablissements);
  } catch (error) {
    console.error("Erreur récupération établissements :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Pour qu'un utilisateur puisse voir tous les établissements qu'il a créé
const getEtablissementsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId requis dans les paramètres." });
    }

    const etablissements = await prisma.etablissement.findMany({
      where: { userId },
    });

    res.status(200).json(etablissements);
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Situation des demandes pour création des établissements
const updateEtabRequestStatus = async (req, res) => {
  try {
    const { requestId, newStatus } = req.body;

    if (!requestId || !["approved", "rejected"].includes(newStatus)) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }

    const request = await prisma.etablissementRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: "Demande introuvable" });
    }

    const updatedRequest = await prisma.etablissementRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Erreur validation/refus demande :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Créer un établissement à partir d'une demande d'un client
const createEtablissementFromRequest = async (req, res) => {
  try {
    const { requestId, secteur, address, ville } = req.body;

    if (!requestId || !secteur || !address || !ville) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    // Récupérer la demande
    const request = await prisma.etablissementRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== "approved") {
      return res.status(400).json({ error: "Demande invalide ou non approuvée." });
    }

    // Créer l’établissement
    const newEtablissement = await prisma.etablissement.create({
      data: {
        name: request.etablissementName,
        secteur,
        address,
        ville,
        userId: request.userId,
      },
    });

    res.status(201).json(newEtablissement);
  } catch (error) {
    console.error("Erreur création établissement depuis demande :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Dans le dashboard du gérant d'un établissement(utilisateur)
const getDashboardEtablissement = async (req, res) => {
  try {
    const { etablissementId } = req.params;

    if (!etablissementId) {
      return res.status(400).json({ error: "etablissementId est requis." });
    }

    const etablissement = await prisma.etablissement.findUnique({
      where: { id: etablissementId },
    });

    if (!etablissement) {
      return res.status(404).json({ error: "Établissement introuvable." });
    }

    // Compter les personnes dans la file
    const enFile = await prisma.waitingList.count({
      where: { etablissementId },
    });

    // Compter ceux qui ont quitté la file (hasLeft: true)
    const hasLeftCount = await prisma.waitingList.count({
      where: {
        etablissementId,
        hasLeft: true,
      },
    });

    res.status(200).json({
      etablissement,
      stats: {
        actuellementDansLaFile: enFile,
        totalQuitteLaFile: hasLeftCount,
      },
    });
  } catch (error) {
    console.error("Erreur dashboard :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};


module.exports = {
  createEtablissementRequest,
  createEtablissement,
  getAllRequests,
  getAllEtablissements,
  updateEtabRequestStatus,
  createEtablissementFromRequest,
  getEtablissementsByUserId,
  getDashboardEtablissement,
};
