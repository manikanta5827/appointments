import { PrismaClient } from "@prisma/client";
import { findUserById } from "../repository/userRepository.js";

const prisma = new PrismaClient();
const USER_TYPE_STUDENT = "student";

export const createAppointment = async (req,res) =>{
    const userId = req.userId;
    let professorId = req.get('professorId');
    let slotId = req.get('slotId');

    const user = await findUserById(userId);

    if(user.role != USER_TYPE_STUDENT) {
        return res.status(403).json({
            status: "error",
            message: "you are not authorised to create a appointment"
        })
    }

    // validate both fields
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

    if(!professorId) {
        return res.status(400).json({
            status: "error",
            message: "slot id is required"
        })
    }

    // check if professor id is integer
    professorId = Number(professorId);
    if(isNaN(professorId)) {
        return res.status(400).json({
            status: "error",
            message: "professor id should be a number"
        })
    }

    // check if there is a slot with that id in professor slots
    const slot = await prisma.slot.findFirst({
        where:{
            professorId,
            id: slotId
        }
    })

    if(!slot) {
        return res.status(404).json({
            status: "error",
            message: "slot doesn't exist in professor slots"
        })
    }

    // if slot exists check if slot is available
    if(slot.isBooked == true) {
        return res.status(409).json({
            status: "error",
            message: "slot is already booked"
        })
    }

    // if slot is not booked then update the slot table and create a entry in appointments table
    await prisma.slot.update({
        where: {
            id: slot.id
        },
        data: {
            isBooked: true
        }
    })

    await prisma.appointment.create({
        data: {
            studentId: user.id,
            professorId,
            slotId : slot.id
        }
    })

    // TODO :: send a mail to both student and professor that appointment is created btween both of them

    return res.status(201).json({
        status: "succuss",
        message: "Appointment is successfully created"
    })
}

export const getAppointments = async (req,res) =>{
    const userId = req.userId;

    const user = await findUserById(userId);

    let appointments = await prisma.appointment.findMany({
        where: {
            studentId: user.id,
            status: 'booked'
        },
        select: {
            slot: {
                select: {
                    id: true,
                    slot: true
                }
            },
            professor: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePic: true
                }
            }
        }
    });

    return res.status(200).json({
        status: "success",
        message: "appointments fetched successfully",
        data: appointments
    });
}

export const cancelAppointment = async (req,res) => {
    const userId = req.userId;
    const appointmentId = req.get('appointment_id');

    const professor = await findUserById(userId);

    if(!appointmentId) {
        return res.status(400).json({
            status: "error",
            message: "slot id is required"
        })
    }

    // check if appointment id is integer
    appointmentId = Number(appointmentId);
    if(isNaN(appointmentId)) {
        return res.status(400).json({
            status: "error",
            message: "appointment id should be a number"
        })
    }

    // find if appointment exists
    const appointment = await prisma.appointment.findFirst({
        where:{
            id: appointmentId,
            professorId: professor.id
        }
    })

    if(!appointment){
        return res.status(400).json({
            status: "error",
            message: "Appointment doesn't exist"
        })
    }

    // place status as cancelled in appointments table
    await prisma.appointment.update({
        where: {
            id : appointmentId
        },
        data: {
            status: 'cancelled'
        }
    })

    return res.status(200).json({
        status: "success",
        message: "Appointment cancelled successfully"
    })
}
