import { logger } from "../utils/winstonLogger.js";
import { PrismaClient } from "@prisma/client";
import { findUserById, findUserByName } from "../repository/userRepository.js";
import { getSlotsOfProfessor } from "../repository/slotsRepository.js";
import { formatSlots } from "../service/slotService.js";

const prisma = new PrismaClient();
const USER_TYPE_PROFESSOR = 'professor';

export const createSlot = async(req,res) =>{
    const userId = req.userId;

    // find the user using the id
    const user = await findUserById(userId);

    // check if user is professor
    if(user.role != USER_TYPE_PROFESSOR) {
        return res.status(403).json({
            status: "error",
            message: "you are not authorised to create a slot"
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
    const isSlotExist = await prisma.slot.findFirst({
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
    await prisma.slot.create({
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

export const getAllSlots = async (req,res) =>{
    const professorName = req.get('professor');

    if(!professorName) {
        return res.status(400).json({
            status: "error",
            message: "professor name is required"
        })
    }
    const professor = await findUserByName(professorName);

    if(!professor) {
        return res.status(400).json({
            status: "error",
            message: "professor name is not valid"
        })
    }

    if(professor.role != USER_TYPE_PROFESSOR) {
        return res.status(400).json({
            status: "error",
            message: "the name is not related to a professor"
        })
    }

    const slots = await getSlotsOfProfessor(professor.id);

    const formattedSlots = formatSlots(slots, professor);

    return res.status(200).json({
        status: "success",
        message: "professor slots fetched successfully",
        pageSize: formattedSlots.length,
        data: formattedSlots
    })
}

export const deleteSlot = async (req,res) =>{

    const professorId = req.userId;
    let slotId = req.get('slotId');
    logger.info(slotId);
    logger.info(typeof(slotId));

    // find the user using the id
    const professor = await findUserById(professorId);

    // check if user is professor
    if(professor.role != USER_TYPE_PROFESSOR) {
        return res.status(403).json({
            status: "error",
            message: "you are not authorised to delete a slot"
        })
    }

    if(!slotId) {
        return res.status(400).json({
            status: "error",
            message: "slot id is required"
        })
    }

    // check if slot id is integer
    slotId = Number(slotId);
    if(isNaN(slotId)) {
        return res.status(400).json({
            status: "error",
            message: "slot id should be a number"
        })
    }

    // now check if the professor has this slot
    const slot = await prisma.slot.findFirst({
        where : {
            id: slotId,
            professorId: professor.id
        }
    })

    if(!slot) {
        return res.status(404).json({
            status: "error",
            message: "no slot present with the slot id and professor"
        })
    }

    // if exists then delete it
    await prisma.slot.delete({
        where: {
            id: slot.id
        }
    })

    return res.status(200).json({
        status: "success",
        message: "slot deleted successfully"
    })
}