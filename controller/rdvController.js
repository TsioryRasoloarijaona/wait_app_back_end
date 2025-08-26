import {
  isOpenTomorrow,
  makeSlots,
  getTomorrowWorkingDetails,
} from "./RdvSlots.js";
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export async function getAvailableSlots(req, res) {
  const { id } = req.params;

  try {
    const isOpen = await isOpenTomorrow(id);
    if (!isOpen) {
      res
        .status(409)
        .json({ message: "this establishment is closed tomorrow" });
      return;
    }

    const establishmentInfo = await getTomorrowWorkingDetails(id);
    const availableSlots = makeSlots(
      establishmentInfo.workingDetail[0].open,
      establishmentInfo.workingDetail[0].close,
      establishmentInfo.duration
    );
    return res.status(200).json(availableSlots);
  } catch (error) {
    console.error(error.message);
  }
}

export async function createRdv(req, res) {
  const { userId, establishmentId, rdvDateTime } = req.body;
  try {
    const create = await prisma.renderVous.create({
      data: {
        userId,
        establishmentId,
        rdvDateTime,
      },
    });
    res.status(201).json(create);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
    console.error(error.message);
  }
}

export async function getRdvByEstablishment(req , res) {
  const {id} = req.params

  try {
    const rdv = await prisma.renderVous.findMany({
      where : {
        establishmentId : id
      },
      include : {
        user : {
          select : {
            email : true ,
            name : true
          }
        }
      },
      orderBy : {
        rdvDateTime : 'asc'
      }
    })
    

    return res.status(200).json(rdv)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({error : error.message})
  }
}
