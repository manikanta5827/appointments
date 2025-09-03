import { PrismaClient } from "@prisma/client";
import { AppointmentStatus, UserRole } from "../enum/bookingStatusEnum.js";
import { sendMail } from "../service/mailer.js";
import { findAppointmentUsingId, getAllProfessorAppointments, getAllStudentAppointments } from "../repository/appointmentRepository.js";

const prisma = new PrismaClient();

export const createAppointment = async (req,res) =>{
    const user = req.user;
    let professorId = req.get('professorId');
    let slotId = req.get('slotId');
    let reason = req.get('reason');

    if(user.role != UserRole.STUDENT) {
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
            message: "professor id is required"
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

    if(!reason || reason.length < 10) {
        return res.status(400).json({
            status: "error",
            message: "reason shoudn't be empty and more than 10 characters"
        })
    }

    // if slot exists check if slot is available
    if(slot.isBooked == true) {
        return res.status(409).json({
            status: "error",
            message: "slot is already booked"
        })
    }

    // check if slot is expired or not
    if(slot.slot < new Date()) {
        return res.status(400).json({
            status: "error",
            message: "slot is expired"
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
            slotId : slot.id,
            reason
        }
    })

    // TODO :: send a mail to both student and professor that appointment is created btween both of them

    return res.status(201).json({
        status: "success",
        message: "Appointment is successfully created"
    })
}

export const getStudentAppointments = async (req,res) =>{
    const user = req.user;
    const status = req.get('status') || AppointmentStatus.BOOKED;

    if(!Object.values(AppointmentStatus).includes(status)) {
        return res.status(400).json({
            status: "error",
            message: "status is not valid"
        })
    }

    if(user.role != UserRole.STUDENT) {
        return res.status(400).json({
            status: "error",
            message: "this api is only for students to get the appointments"
        })
    }

    const appointments = await getAllStudentAppointments(user, status)

    return res.status(200).json({
        status: "success",
        message: "appointments fetched successfully",
        pageSize: appointments.length,
        data: appointments
    });
}

export const getProfessorAppointments = async (req,res) => {
    const user = req.user;
    const status = req.get('status') || AppointmentStatus.BOOKED;

    if(!Object.values(AppointmentStatus).includes(status)) {
        return res.status(400).json({
            status: "error",
            message: "status is not valid"
        })
    }

    if(user.role != UserRole.PROFESSOR) {
        return res.status(400).json({
            status: "error",
            message: "this api is only for professors to get the appointments"
        })
    }

    const appointments = await getAllProfessorAppointments(user, status);

    return res.status(200).json({
        status: "success",
        message: "appointments fetched successfully",
        pageSize: appointments.length,
        data: appointments
    });
}

export const cancelAppointment = async (req,res) => {
    const user = req.user;
    let appointmentId = req.get('appointment_id');


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
    const appointment = await findAppointmentUsingId(appointmentId, user);

    if(!appointment){
        return res.status(400).json({
            status: "error",
            message: "Appointment doesn't exist"
        })
    }

    if(appointment.status === AppointmentStatus.CANCELLED) {
        return res.status(200).json({
            status: "success",
            message: "Appointment cancelled successfully"
        })
    }

    // place status as cancelled in appointments table
    await prisma.appointment.update({
        where: {
            id : appointmentId
        },
        data: {
            status: AppointmentStatus.CANCELLED
        }
    })

    // TODO :: make this async background task
    await sendMail(
        appointment.student.email,
        "Appointment cancelled",
        "appointment_cancel",
        {receiverName : appointment.student.username, slot: appointment.slot.slot, professor: appointment.professor.username }
    );

    return res.status(200).json({
        status: "success",
        message: "Appointment cancelled successfully"
    })
}
