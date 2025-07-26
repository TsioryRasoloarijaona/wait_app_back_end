//Moi
let io;

function setIO(socketInstance) {
  io = socketInstance;
}

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();


// Voir toutes les personnes dans la file (encore actives) d’un établissement sans entrer dans la file
const getActiveWaitList = async (req, res) => {
  const { establishmentId } = req.params;

  try {
    const waitList = await prisma.waitingList.findMany({
      where: {
        establishmentId,
        hasLeft: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json(waitList);
  } catch (error) {
    console.error("Erreur récupération file active :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Ajouter à la file d'attente
const joinWaitList = async (req, res) => {
  try {
    const { name, email, userId, establishmentId } = req.body;

    if (!name || !email || !userId || !establishmentId) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    //Vérifie que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment) {
      return res.status(404).json({ error: "Établissement introuvable." });
    }

    // Vérifie si l'utilisateur est déjà inscrit dans cette file (et n’a pas quitté)
    const alreadyInQueue = await prisma.waitingList.findFirst({
      where: {
        userId,
        establishmentId,
        hasLeft: false,
      },
    });

    if (alreadyInQueue) {
      return res.status(400).json({ error: "Vous êtes déjà inscrit dans la file." });
    }

    const count = await prisma.waitingList.count({
      where: { establishmentId, hasLeft: false }
    });

    const newEntry = await prisma.waitingList.create({
      data: {
        name,
        email,
        userId,
        establishmentId,
        position: count + 1,
        hasLeft: false,
      },
    });

    if (io) {
      io.emit('new-waiting-entry', newEntry);
    }

    res.status(201).json(newEntry);

  } catch (error) {
    console.error("Erreur lors de l'ajout à la file :", error);
    res.status(500).json({ error: "Erreur lors de l'ajout à la file." });
  }
  
};

// Obtenir la position actuelle d’un utilisateur dans la file
const getUserPosition = async (req, res) => {
  const { userId, etablissementId } = req.params;

  try {
    // Trouver l'utilisateur dans la file
    const user = await prisma.waitingList.findFirst({
      where: {
        userId,
        establishmentId,
        hasLeft: false,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé ou a déjà quitté la file." });
    }

    // Compter combien de personnes ont été ajoutées avant lui et sont encore dans la file
    const peopleBefore = await prisma.waitingList.count({
      where: {
        establishmentId,
        hasLeft: false,
        createdAt: {
          lt: user.createdAt,
        },
      },
    });

    res.status(200).json({
      userId,
      etablissementId,
      positionActuelle: peopleBefore + 1,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la position :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

//Historique des personnes qui sont ou ont été dans la file t'attente
const getWaitListByEtablissement = async (req, res) => {
  const { establishmentId } = req.params;

  try {
    const waitList = await prisma.waitingList.findMany({
      where: { establishmentId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(waitList);
  } catch (error) {
    console.error("Erreur lors de la récupération de la file par établissement :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Supprimer quelqu'un de la file d'attente d'un établissement donné
const removeFromWaitList = async (req, res) => {
  const { userId, establishmentId } = req.params;

  try {
    const userToRemove = await prisma.waitingList.findFirst({
      where: {
        userId,
        establishmentId,
        hasLeft: false
      }
    });

    if (!userToRemove) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (userToRemove.hasLeft) {
    return res.status(400).json({ error: "Cet utilisateur a déjà quitté la file." });
    }


    const removedPosition = userToRemove.position;

     // Mettre à jour hasLeft à true au lieu de supprimer
    await prisma.waitingList.update({
      where: { id: userToRemove.id },
      data: { hasLeft: true },
    });

    // 3. Mettre à jour les positions des suivants
    await prisma.waitingList.updateMany({
      where: {
        position: { gt: removedPosition },
        establishmentId,
        hasLeft: false
      },
      data: {
        position: { decrement: 1 }
      }
    });

      if (io) {
      io.emit('user-left-waitlist', {
        userId,
        establishmentId,
        removedPosition,
      });
    }

    const remainingCount = await prisma.waitingList.count({
      where: { establishmentId, hasLeft: false }
    });

    if (remainingCount === 0 && io) {
      io.emit('waitlist-empty', { establishmentId });
    }

    res.status(200).json({ message: "Utilisateur supprimé de la file d'attente avec succès" });

  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
};

module.exports = {
  setIO,
  getActiveWaitList,
  joinWaitList,
  getUserPosition,
  getWaitListByEtablissement,
  removeFromWaitList,
};


