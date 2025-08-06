import express from 'express';
import { register, login, getUserProfile, deleteUser, requestOtp, verifyOtp, resetPassword, verifyEmailByLink, verifyEmailByOtp, resendOTP } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmailByLink);
router.post('/verify-email-otp', verifyEmailByOtp);
router.post('/resend-otp', resendOTP);
router.get('/profile/:username', verifyToken, getUserProfile);
router.delete('/delete', verifyToken, deleteUser);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);



export default router;
