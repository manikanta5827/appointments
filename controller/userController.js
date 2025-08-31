import {logger} from '../utils/winstonLogger.js';
import { PrismaClient } from '@prisma/client';
import { formatUserResponse } from '../service/userService.js';

const prisma = new PrismaClient();

export const getProfile = async (req,res) => {

    const username = req.params.username;

    if(!username) {
        return res.status(400).json({
            status: "error",
            message: "username is required"
        })
    }
    
    // find the user using the id
    const user = await prisma.user.findUnique({
        where: {
            username : username
        }
    })

    logger.info(`user.lastLogin at ${user.lastLogin}`);
    // update login activity
    await prisma.user.update({
        where:{
            id:user.id
        },
        data: {
            lastLogin: new Date()
        }
    })

    const formattedData = formatUserResponse(user);
    res.status(200).json(formattedData)
} 