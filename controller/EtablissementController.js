const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const getByUserId = require("./userController").getByUserId;

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
    console.error(error.message);
    res.status(500).json({
      error: "some fields are empty" + error.message,
    });
  }
};

const getCategoryById = async (id) => {
  try {
    const categories = await prisma.category.findUnique({
      where: { id: id },
    });
    return categories;
  } catch (error) {}
};

const getEstablishmentsByStatus = async (req, res) => {
  const status = req.params.status;
  const result = [];
  try {
    const requests = await prisma.establishment.findMany({
      where: {
        status: status,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    for (let i = 0; i < requests.length; i++) {
      const username = await getByUserId(requests[i].adminId);
      const categoryName = await getCategoryById(requests[i].categoryId);
      let user = {
        name: username.name,
        categoryName: categoryName.name,
        establishmentInfo: requests[i],
      };
      result.push(user);
    }
    res.status(200).json(result);
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
  const data = req.body;
  let updated = [];
  let failed = [];

  try {
    for (const item of data) {
      const { establishmentId, newStatus } = item;

      if (!establishmentId || !newStatus) {
        failed.push({ item, reason: "ID ou status manquant" });
        continue;
      }

      try {
        const establishmentUpdated = await prisma.establishment.update({
          where: { id: establishmentId },
          data: { status: newStatus },
        });

        updated.push(establishmentUpdated);
      } catch (err) {
        failed.push({ item, reason: err.message });
      }
    }

    return res.status(200).json({
      updatedCount: updated.length,
      failedCount: failed.length,
      updated,
      failed,
    });
  } catch (error) {
    console.error("Erreur validation/refus demande :", error);
    return res.status(500).json({ error: "Erreur serveur" });
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

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des catégories." });
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
  updateEstablishmentPicture,
  getAllCategories,
  //getDashboardEtablissement,
};
