import express from "express";
import * as userController from '../controller/userController.js';
import * as authController from "../controller/authController.js";
import authHandler from "../middleware/authHandler.js";
const router = express.Router();

// auth routes
router.post('/user/create', authController.createUser);
router.post('/user/verify', authController.verifyEmail);
router.post('/user/login', authController.login);

// user routes
router.get('/user/profile',authHandler, userController.getProfile);


export default router;