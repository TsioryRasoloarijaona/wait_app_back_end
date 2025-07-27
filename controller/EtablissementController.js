const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createCategory = async (categoryName) => {
  const category = await prisma.category.create({
    data: {
      name: categoryName,
    },
  });

  return category.id;
};

const createEtablissementRequest = async (req, res) => {
  try {
    let { adminId, name, categoryId, categoryName, address, city } = req.body;

    if (!categoryId) {
      const newCategoryId = await createCategory(categoryName);
      categoryId = newCategoryId;
    }

    const newEstablishment = await prisma.establishment.create({
      data: {
        adminId,
        name,
        categoryId,
        address,
        city,
      },
    });
    res.status(201).json(newEstablishment);
  } catch (error) {
    res.status(500).json({
      error: "some fields are empty" + error.message,
    });
  }
};

const getEstablishmentsByStatus = async (req, res) => {
  const status = req.params.status;
  try {
    const requests = await prisma.establishment.findMany({
      where: {
        status: status,
      },
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getEtablissementsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId requis dans les paramètres." });
    }

    const etablissements = await prisma.establishment.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json(etablissements);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur.", error: error.message });
  }
};

const updateEtabRequestStatus = async (req, res) => {
  try {
    const { establishmentId, newStatus } = req.body;
    const establishmentUpdated = await prisma.establishment.update({
      where: { id: establishmentId },
      data: { status: newStatus },
    });
    res.status(200).json(establishmentUpdated);
  } catch (error) {
    console.error("Erreur validation/refus demande :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const updateEstablishmentPicture = async (req, res) => {
  try {
    const { establishmentId, pictureUrl } = req.body;
    if (!establishmentId || !pictureUrl) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: { imageUrl: pictureUrl },
    });
    res.status(200).json(updatedEstablishment);
  } catch (error) {}
};

const createEtablissementFromRequest = async (req, res) => {
  try {
    const { requestId, secteur, address, ville } = req.body;

    if (!requestId || !secteur || !address || !ville) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const request = await prisma.etablissementRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== "approved") {
      return res
        .status(400)
        .json({ error: "Demande invalide ou non approuvée." });
    }

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

/*const getDashboardEtablissement = async (req, res) => {
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

    const enFile = await prisma.waitingList.count({
      where: { etablissementId },
    });

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
};*/

module.exports = {
  createEtablissementRequest,
  getEstablishmentsByStatus,
  getEtablissementsByUserId,
  updateEtabRequestStatus,
  createEtablissementFromRequest,
  updateEstablishmentPicture
  //getDashboardEtablissement,
};
