// routes/rewardRoutes.js
import express from 'express';
import { rewardPiCredit } from '../controllers/rewardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/credit', protect, rewardPiCredit);

export default router;
