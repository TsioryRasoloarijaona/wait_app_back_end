import { PrismaClient } from "../generated/prisma/index.js";
import { upDateWaitList } from "../helper/WebsocketManager.js";
import { getByUserId } from "./userController.js";
import { startOfDay, endOfDay } from "date-fns";
import { sendToAdmin } from "../helper/WebsocketManager.js";
import { is } from "date-fns/locale";

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

const getLineInfo = async (id) => {
  try {
    const lineInfo = await prisma.waitingList.findUnique({
      where: { id: id },
      includes : {
        user : {
          select : {
            name : true,
            email : true,
          }
        }
      }
    });
    return lineInfo;
  } catch (error) {
    console.error(error.message);
  }
};

const insertWaitList = async (req, res) => {
  const { userId, establishmentId } = req.body;
  try {
    const isPresent = await prisma.waitingList.findFirst({
      where: {
        userId: userId,
        establishmentId: establishmentId,
        waitingListStatus: "waiting",
      },
    });

    if (isPresent) {
      console.log(isPresent.waitingListStatus, isPresent.establishmentId);
      res.status(409).json({ error: "you are already on the line" });
      return;
    }
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
    const adminId = await prisma.establishment.findUnique({
      where: {
        id: establishmentId,
      },
    });
    const newLine = await getLineInfo(waitList.id);
    sendToAdmin(adminId.adminId, "admin", newLine);

    res.status(201).json({ position: totalLine });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error.message);
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

const getWaitListByEstablishment = async (req, res) => {
  const { establishmentId } = req.params;
  let data = [];
  try {
    const list = await prisma.waitingList.findMany({
      where: {
        establishmentId: establishmentId,
        arrivalTime: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
      include : {
        user : {
          select : {
            name : true,
            email : true,
          }
        }
      }
    });



    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
    console.log(error.message);
  }
};

export {
  getTotalWaitingList,
  insertWaitList,
  updateLine,
  getWaitListByEstablishment,
};
