import express from 'express';
import rateLimit from 'express-rate-limit';
import { piLogin, getProfile, updateProfile, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts. Please try again later.',
});

// Base welcome route
router.get('/', (req, res) => {
  res.send('Welcome to the Pi SDK Backend');
});

// 🔐 Pi Auth routes
router.post('/pi-login', loginLimiter, piLogin);
router.get('/profile', protect, getProfile);
router.patch('/update-profile', protect, updateProfile);
router.delete('/delete-account', protect, deleteAccount);

export default router;
