import { PrismaClient } from "../generated/prisma/index.js";
import { getByUserId, addPermissions } from "./userController.js";
import { getTotalWaitingList as waitListTotal } from "./WaitListController.js";
import { sendEmail } from "../helper/emailService.js";

const prisma = new PrismaClient();

const createEstablishmentRequest = async (req, res) => {

  let { adminId, generalInfo , placeInfo, contactInfo,workingDetail ,imageUrl } = req.body;

  const user = await getByUserId(adminId);
  if (!user) {
    return res.status(500).json({ error: "this admin id is not valid" });
  }

  try {
    const inserted = await prisma.establishment.create({
      data : {
        adminId ,
        generalInfo ,
        placeInfo,
        contactInfo ,
        workingDetail ,
        imageUrl,
      }
    })

    return res.status(201).json(inserted);

  } catch (error) {
    console.error(error.message);
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
      orderBy: {
        createdAt: "desc",
      },
      include : {
        waitingList : {
          where: {
            waitingListStatus: "waiting"
          }
        } ,
        admin : {
          select : {
            name : true,
            email : true,
          }
        } ,

      }
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getEstablishmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId requis dans les paramètres." });
    }

    const establihments = await prisma.establishment.findFirst({
      where: {
        adminId: userId,
      },
      include : {
        admin : {
          select : {
            name : true,
            email : true,
          }
        }
      }
    });

    res.status(200).json(establihments);
  } catch (error) {
    res.status(500).json({ error:"error from the server" });
    console.error(error.message) ;
  }
};

const updateEstablishmentStatus = async (req, res) => {
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
        const adminInfo = await prisma.establishment.findFirst({
          where: {
            id: establishmentId,
          },
        });
        await addPermissions(adminInfo.adminId, ["user", "admin"]);
        const emailAdmin = await getByUserId(adminInfo.adminId);
        await sendEmail({
          to: emailAdmin.email,
          subject: `reponse de demande sur wait app`,
          text: `${
            newStatus == "approved"
              ? "nous somme ravis de vous annoncer que votre demande à été approuvé"
              : "desolé"
          }`,
        });
        console.log('email send to' , emailAdmin.email)

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

const countEstablishmentsByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const count = await prisma.establishment.count({
      where: {
        status: status,
      },
    });

    res.status(200).json({ total: count });
  } catch (error) {
    console.error("Erreur lors du comptage des établissements :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const countEtablissementsThisWeek = async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const count = await prisma.establishment.count({
      where: {
        createdAt: {
          gte: monday,
          lte: sunday,
        },
      },
    });

    res.status(200).json({ weekStart: monday, weekEnd: sunday, total: count });
  } catch (error) {
    console.error(
      "Erreur lors du comptage des établissements de la semaine :",
      error
    );
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export {
  createEstablishmentRequest,
  getEstablishmentsByStatus,
  getEstablishmentsByUserId,
  updateEstablishmentStatus,
  createEtablissementFromRequest,
  updateEstablishmentPicture,
  getAllCategories,
  countEstablishmentsByStatus,
  countEtablissementsThisWeek,
};
