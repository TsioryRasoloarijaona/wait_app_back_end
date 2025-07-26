//Moi

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createEtablissementRequest = async (req, res) => {
  try {
    const { userId, etablissementName, category, address, city } = req.body;

    //Vérifie si le userId et le nom de l'établissement à créer sont donnés
    if (!userId || !etablissementName || !category || !address || !city) {
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
    const existing = await prisma.establishmentRequest.findFirst({
      where: {
        userId,
        establishmentName,
        status: "pending"
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Une demande est déjà en attente." });
    }

    const newRequest = await prisma.establishmentRequest.create({
      data: { userId, establishmentName, category, address, city },
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
    const { userId, name, category, address, city } = req.body;

    if (!userId || !name || !category || !address || !city) {
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
    const newEstablishment = await prisma.establishment.create({
      data: {
        name,
        category,
        address,
        city
      },
    });

    // Créer la relation établissement-admin
    await prisma.establishmentAdmin.create({
      data: {
        userId,
        establishmentId: newEstablishment.id,
      },
    });

    res.status(201).json(newEstablishment);
  } catch (error) {
    console.error("Erreur lors de la création de l'établissement :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Voir tous les demandes
const getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.establishmentRequest.findMany();
    res.status(200).json(requests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Voir tous les établissements
const getAllEtablissements = async (req, res) => {
  try {
    const etablissements = await prisma.establishment.findMany({
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

    const etablissementsAdmin = await prisma.establishmentAdmin.findMany({
      where: { userId },
      include: { establishment: true },
    });

    const etablissements = etablissementsAdmin.map((ea) => ea.establishment);

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

    const request = await prisma.establishmentRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ error: "Demande introuvable" });
    }

    const updatedRequest = await prisma.establishmentRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Erreur validation/refus demande :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Créer un établissement à partir d'une demande approuvée
const createEtablissementFromRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ error: " requestId requis." });
    }

    // Récupérer la demande
    const request = await prisma.establishmentRequest.findUnique({ where: { id: requestId } });

    if (!request || request.status !== "approved") {
      return res.status(400).json({ error: "Demande invalide ou non approuvée." });
    }

    // Créer l’établissement
    const newEstablishment = await prisma.establishment.create({
      data: {
        name: request.establishmentName,
        category: request.category,
        address: request.address,
        city: request.city,
      },
    });

    // Créer la relation établissement-admin
    await prisma.establishmentAdmin.create({
      data: {
        userId: request.userId,
        establishmentId: newEstablishment.id,
      },
    });

    await prisma.establishmentRequest.delete({ where: { id: request.id } });

    res.status(201).json(newEtablissement);
  } catch (error) {
    console.error("Erreur création établissement depuis demande :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Dans le dashboard du gérant d'un établissement(utilisateur)
const getDashboardEtablissement = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({ error: "establishmentId est requis." });
    }

    const establishment = await prisma.establishment.findUnique({ where: { id: establishmentId } });
    if (!establishment) {
      return res.status(404).json({ error: "Établissement introuvable." });
    }

    // Compter les personnes dans la file
    const enFile = await prisma.waitingList.count({
      where: { establishmentId, hasLeft: false },
    });

    // Compter ceux qui ont quitté la file (hasLeft: true)
    const hasLeftCount = await prisma.waitingList.count({
      where: { establishmentId, hasLeft: true },
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
