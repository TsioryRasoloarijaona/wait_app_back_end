import { PrismaClient } from "../generated/prisma/index.js";
import { upDateWaitList } from "../helper/WebsocketManager.js";

const prisma = new PrismaClient();

const getTotalWaitingList = async (id) => {
  try {
    const total = await prisma.waitingList.count({
      where: {
        establishmentId: id,
        waitingListStatus: "waiting",
      },
    });
    return total;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const insertWaitList = async (req, res) => {
  const { userId, establishmentId } = req.body;
  try {
    const waitList = await prisma.waitingList.create({
      data: {
        userId,
        establishmentId,
      },
    });
    const totalLine = await getTotalWaitingList(establishmentId);
    upDateWaitList({
      establishmentId,
      total: totalLine,
    });
    res.status(201).json({ position: totalLine });
  } catch (error) {
    /*  */
    res.status(500).json({ error: error.message });
  }
};

const updateLine = async (req, res) => {
  const { waitListId, waitingListStatus } = req.body;

  try {
    const updateLine = await prisma.waitingList.update({
      where: {
        id: waitListId,
      },
      data: {
        waitingListStatus: waitingListStatus,
      },
    });
    const establishmentId = updateLine.establishmentId;
    const total = await getTotalWaitingList(establishmentId);

    upDateWaitList({
      establishmentId,
      total,
    });
    res.status(200).json(updateLine);
  } catch (error) {
    console.error(error.message);
  }
};

export { getTotalWaitingList, insertWaitList, updateLine };
