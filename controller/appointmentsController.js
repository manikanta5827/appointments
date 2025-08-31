import { logger } from "../utils/winstonLogger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const USER_TYPE_PROFESSOR = 'professor';

export const createSlot = async(req,res) =>{
    const userId = req.userId;

    // find the user using the id
    const user = await prisma.user.findUnique({
        where: {
            id : userId
        }
    })

    // check if user is professor
    if(user.role != USER_TYPE_PROFESSOR) {
        return res.status(403).json({
            status: "error",
            message: "you are not authorised to access this api"
        })
    }

    let slot = req.get('slot');

    if(!slot) {
        return res.status(400).json({
            status: "error",
            message: "slot is required"
        })
    }

    // validate if it is correct date time or not
    try {
        slot = new Date(slot);
    } catch (error) {
        logger.info('failed to create date from slot');
        return res.status(400).json({
            status: "error",
            message: "slot is not a valid date time , try to send it in 2015-03-25T12:00:00Z this format"
        })
    }

    // check if slot is past in time
    if(slot < new Date()) {
        return res.status(400).json({
            status: "error",
            message: "slot shouldn't be in past"
        })
    }

    // check if slot is in too future like after 1 year
    let aYearFromNow = new Date();
    aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

    if(slot > aYearFromNow) {
        return res.status(400).json({
            status: "error",
            message: "slot shouldn't be more than 1 year in gap"
        })
    }

    // check if there is any slot for this professor for the exact time
    const isSlotExist = await prisma.availableSlots.findFirst({
        where: {
            professorId: user.id,
            slot: slot
        }
    })

    if(isSlotExist) {
        return res.status(409).json({
            status: "failed",
            message: "slot already exist on same time"
        })
    }

    // create it
    await prisma.availableSlots.create({
        data: {
            professorId: user.id,
            slot
        }
    })

    return res.status(201).json({
        status: "success",
        message: "slot is created successfully"
    })
}

export const getAllSlots = (req,res) =>{

}