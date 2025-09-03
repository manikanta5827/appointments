import { PrismaClient } from '@prisma/client';
import { formatUser } from '../service/userService.js';
import { findUserByName } from '../repository/userRepository.js';

const prisma = new PrismaClient();

export const getProfile = async (req,res) => {

    const username = req.get('username');

    if(!username) {
        return res.status(400).json({
            status: "error",
            message: "username is required"
        })
    }
    
    // find the user using the id
    const user = await findUserByName(username);

    // update login activity
    await prisma.user.update({
        where:{
            id:user.id
        },
        data: {
            lastLogin: new Date()
        }
    })

    if(!user) {
        return res.status(404).json({
            status: "failed",
            message: "user doesn't exist"
        })
    }

    const formattedData = formatUser(user);
    res.status(200).json(formattedData)
} 