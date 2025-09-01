import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUserById = async (id) =>{
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })

    return user;
}

export const findUserByName = async (username) => {
    const user = await prisma.user.findUnique({
        where: {
            username
        }
    })

    return user;
}

export const findUserByMail = async (email) =>{
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    return user;
}