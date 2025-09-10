import { logger } from '../utils/winstonLogger.js';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
import { generateAuthToken } from '../service/authService.js';
import { findUserByMail, findUserByName } from '../repository/userRepository.js';
import { UserRole } from '../enum/bookingStatusEnum.js';
import { formatUser } from '../service/userService.js';

dotenv.config();
const prisma = new PrismaClient();
const saltRounds = 10;
const EMAIL_VERIFICATION_SECRET_CODE = process.env.EMAIL_VERIFICATION_SECRET_CODE;
const EMAIL_VERIFICATION_EXPIRATION_TIME = 1000 * 60 * 10

export const createUser = async (req,res) => {
    let username = req.get('username');
    let email = req.get('email');
    let password = req.get('password');
    let isProfessor = req.get('is_professor') || false;

    if(!username) {
        return res.status(400).json({
            status: "error",
            message: "Username is required",
        });
    }

    if(!email) {
        return res.status(400).json({
            status: "error",
            message: "Email is required",
        });
    }

    if(!password) {
        return res.status(400).json({
            status: "error",
            message: "Password is required",
        });
    }

    const existingEmail = await findUserByMail(email);

    const existingUsername = await findUserByName(username);

    if(existingUsername) {
        return res.status(400).json({
            status: "error",
            message: "Username already exists",
        });
    }

    if(existingEmail) {
        return res.status(400).json({
            status: "error",
            message: "Email already exists",
        });
    }

    // validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        return res.status(400).json({
            status: "error",
            message: "Invalid email format",
        });
    }

    if(password.length < 8) {
        return res.status(400).json({
            status: "error",
            message: "Password must be at least 8 characters long",
        });
    }

    // validate if password contains at least one uppercase letter, one lowercase letter, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!passwordRegex.test(password)) {
        return res.status(400).json({
            status: "error",
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
    }

    if(username.length < 3) {
        return res.status(400).json({
            status: "error",
            message: "Username must be at least 3 characters long",
        });
    }

    if(username.length > 20) {
        return res.status(400).json({
            status: "error",
            message: "Username must be less than 20 characters long",
        });
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if(!usernameRegex.test(username)) {
        return res.status(400).json({
            status: "error",
            message: "Username should only contain letters and numbers",
        });
    }

    if(typeof(isProfessor) != "boolean") {
        return res.status(400).json({
            status: "error",
            message: "is_professor field should be true or false"
        })
    } 
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            role: isProfessor == true ? UserRole.PROFESSOR : UserRole.STUDENT
        },
    });

    return res.status(201).json({
        status: "success",
        message: "User created successfully",
        user : formatUser(user)
    });
}

export const login = async (req, res) =>{

    const username = req.get('username');
    const email = req.get('email');
    const password = req.get('password');

    if(!email && !username) {
        return res.status(400).json({
            status: "error",
            message: "email or username is required"
        })
    }

    if(!password) {
        return res.status(400).json({
            status: "error",
            message: "password is required"
        })
    }

    let user = null;
    // If no username find the user using email
    if(!username) {
        user = await findUserByMail(email);
    }
    else {
        user = await findUserByName(username);
    }

    if(!user) {
        return res.status(404).json({
            status: "error",
            message: "user not found"
        })
    }

    //compare passwords
    const isSame = await bcrypt.compare(password, user.password);

    if(!isSame) {
        return res.status(400).json({
            status: "error",
            message: "password incorrect"
        })
    }
    logger.info('generating token')

    const authToken = generateAuthToken(user);

    return res.status(200).json({
        status: "success",
        authToken: authToken
    })
}