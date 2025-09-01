import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/winstonLogger.js";

const prisma = new PrismaClient();

export const getSlotsOfProfessor = async (professorId) =>{
    const slots = await prisma.slot.findMany({
        where:{
            professorId
        },
        orderBy: {
            slot: 'asc'
        }
    })
    return slots;
}