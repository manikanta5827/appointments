import { logger } from '../utils/winstonLogger.js';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
import { generateAuthToken } from '../service/authService.js';
import { findUserByMail, findUserByName } from '../repository/userRepository.js';

dotenv.config();
const prisma = new PrismaClient();
const saltRounds = 10;
const EMAIL_VERIFICATION_SECRET_CODE = process.env.EMAIL_VERIFICATION_SECRET_CODE;
const EMAIL_VERIFICATION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 MINS
const USER_TYPE_PROFESSOR = "professor";
const USER_TYPE_STUDENT = "student";

export const createUser = async (req,res) => {
    let username = req.get('username');
    let email = req.get('email');
    let password = req.get('password');
    let isProfessor = req.get('is_professor') || false;

    // validate the request body
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

    // check if the user already exists
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

    // validate the password
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

    // validates the username
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
    // validate username should only contains letters
    const usernameRegex = /^[a-zA-Z]+$/;
    if(!usernameRegex.test(username)) {
        return res.status(400).json({
            status: "error",
            message: "Username should only contains letters",
        });
    }

    // validate is professor field
    if(typeof(isProfessor) != "boolean") {
        return res.status(400).json({
            status: "error",
            message: "is_professor field should be true or false"
        })
    } 
    
    // hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //create the user
    await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            role: isProfessor == true ? USER_TYPE_PROFESSOR : USER_TYPE_STUDENT
        },
    });

    // send a verification mail to the user
    let expirationTime = Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME;
    let combinedSecret = `${EMAIL_VERIFICATION_SECRET_CODE}-${email}-${expirationTime}`;
    let code = await bcrypt.hash(combinedSecret, saltRounds);

    // TODO send mail to user for now log it
    logger.info(`Email verification send to user::${email} link::http://localhost:3400/user/verify?code=${code}&email=${email}&expiration_time=${expirationTime}`);

    return res.status(201).json({
        status: "success",
        message: "User created successfully"
    });
}

export const verifyEmail = async (req, res) => {
    let code = req.get('code');
    let email = req.get('email');
    let expirationTime = req.get('expiration_time');

    logger.info(code);
    // validate the request body
    if(!code) {
        return res.status(400).json({
            status: "error",
            message: "Code is required",
        });
    }

    if(!email) {
        return res.status(400).json({
            status: "error",
            message: "email is required"
        })
    }

    if(!expirationTime) {
        return res.status(400).json({
            status: "error",
            message: "missing expiration time"
        })
    }

    let combinedSecret = `${EMAIL_VERIFICATION_SECRET_CODE}-${email}-${expirationTime}`;
    let isSame = await bcrypt.compare(combinedSecret, code);
    logger.info(`combinedcode ${combinedSecret}`);
    logger.info(`code ${code}`);

    if(!isSame) {
        return res.status(400).json({
            status: "error",
            message: "Invalid code",
        });
    }

    // check if link is expired
    if(Date.now() > expirationTime) {
        return res.status(400).json({
            status: "error",
            message: "link expired"
        })
    }

    // update the user emailVerified to true
    await prisma.user.update({
        where: { email },
        data: {
            emailVerified: true
        }
    });

    return res.status(200).json({
        status: "success",
        message: "Email verification successful"
    })
}

export const login = async (req, res) =>{

    const username = req.get('username');
    const email = req.get('email');
    const password = req.get('password');

    //validate inputs
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
    // generate auth jwt token
    const authToken = generateAuthToken(user);

    return res.status(200).json({
        status: "success",
        authToken: authToken
    })
}