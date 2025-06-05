import express from 'express';
import {
  approvePayment,
  completePayment,
  cancelPayment,
  handleIncomplete,
  checkPaymentStatus,
  verifyRewardedAd,
  logDebugInfo,
} from '../controllers/piPaymentController.js';

const router = express.Router();

// Pi Payment routes
router.post('/approve', approvePayment);
router.post('/complete', completePayment);
router.post('/cancel', cancelPayment);
router.post('/incomplete', handleIncomplete);
router.get('/check/:paymentId', checkPaymentStatus);

// Ads / Reward verification
router.post('/ads/verify', verifyRewardedAd);

// Optional: debug
router.post('/log-debug', logDebugInfo);

export default router;
