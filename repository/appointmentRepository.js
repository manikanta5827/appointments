
export const getAllStudentAppointments = async (user, status) => {
    let appointments = await prisma.appointment.findMany({
        where: {
            studentId: user.id,
            status
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
            },
            reason: true,
            status: true
        }
    });

    return appointments;
}

export const getAllProfessorAppointments = async (user, status) =>{
    let appointments = await prisma.appointment.findMany({
        where: {
            professorId: user.id,
            status
        },
        select: {
            id: true,
            slot: {
                select: {
                    id: true,
                    slot: true
                }
            },
            student: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePic: true
                }
            },
            reason: true,
            status: true
        }
    });

    return appointments;
}

export const findAppointmentUsingId = async (appointmentId, user) => {
    const appointment = await prisma.appointment.findFirst({
        where:{
            id: appointmentId,
            professorId: user.id
        },
        include: {
            student: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            },
            professor: {
                select: {
                    id: true,
                    username: true
                }
            },
            slot: {
                select: {
                    id: true,
                    slot: true
                }
            }
        }
    });

    return appointment;
}