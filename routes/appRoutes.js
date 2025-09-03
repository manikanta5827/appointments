import express from "express";
import * as userController from '../controller/userController.js';
import * as authController from "../controller/authController.js";
import * as slotController from "../controller/slotController.js";
import * as appointmentController from "../controller/appointmentController.js";
import authHandler from "../middleware/authHandler.js";
import reqStack from "../middleware/reqHandler.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(reqStack);

// auth routes
router.post('/user/create', authController.createUser);
router.post('/user/login', authController.login);

// user routes
router.get('/user/profile/:username', userController.getProfile);


// slot api's
router.post('/slot', authHandler, slotController.createSlot);
router.get('/slots', slotController.getAllSlots);
router.delete('/slot/:slotId', authHandler, slotController.deleteSlot);

// appointment api's
router.post('/appointment', authHandler, appointmentController.createAppointment);
router.get('/student/appointments', authHandler, appointmentController.getStudentAppointments);
router.get('/professor/appointments', authHandler, appointmentController.getProfessorAppointments);
router.patch('/appointment', authHandler, appointmentController.cancelAppointment);

export default router;