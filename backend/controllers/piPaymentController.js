// controllers/piPaymentController.js
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const BASE_URL = 'https://api.minepi.com/v2/payments';
const ADS_URL = 'https://api.minepi.com/v2/ads';

const getHeaders = () => ({
  Authorization: `Key ${process.env.PI_API_KEY}`,
});

export const approvePayment = async (req, res) => {
  const { paymentId, accessToken } = req.body;

  if (!paymentId || !accessToken) {
    return res.status(400).json({ error: 'Missing paymentId or accessToken' });
  }

  try {
    const userRes = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;
    let verified = false;
    let verifyData = null;

    await new Promise((r) => setTimeout(r, 4000));

    for (let i = 0; i < 10; i++) {
      try {
        const verifyRes = await axios.get(`${BASE_URL}/${paymentId}`, {
          headers: getHeaders(),
        });
        verifyData = verifyRes.data;
        verified = true;
        break;
      } catch (err) {
        if (err.response?.data?.error === 'payment_not_found') {
          await new Promise((r) => setTimeout(r, 2000));
        } else {
          return res.status(400).json({ error: 'Missing adId', raw: result });

        }
      }
    }

    if (!verified) {
      return res.status(404).json({ error: 'Payment not found. Try again shortly.' });
    }

    const response = await axios.post(`${BASE_URL}/${paymentId}/approve`, {}, { headers: getHeaders() });
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
};

export const completePayment = async (req, res) => {
  const { paymentId, txid, accessToken } = req.body;

  if (!paymentId || !txid || !accessToken) {
    return res.status(400).json({ error: 'Missing paymentId, txid or accessToken' });
  }

  try {
    const userInfo = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const piUsername = userInfo.data.username;
    const user = await User.findOne({ piUsername });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existingTx = await Transaction.findOne({ txid });
    if (existingTx) return res.status(200).json({ message: 'Transaction already recorded.' });

    const response = await axios.post(`${BASE_URL}/${paymentId}/complete`, { txid }, { headers: getHeaders() });

    await Transaction.create({
      user: user._id,
      paymentId,
      txid,
      amount: 0.5,
      memo: 'Mainnet payment',
      status: 'completed',
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Completion failed' });
  }
};

export const cancelPayment = async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

  try {
    const response = await axios.post(`${BASE_URL}/${paymentId}/cancel`, {}, { headers: getHeaders() });
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Cancel failed' });
  }
};

export const checkPaymentStatus = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const { data } = await axios.get(`${BASE_URL}/${paymentId}`, { headers: getHeaders() });
    res.status(200).json({ status: data.status || 'unknown', raw: data });
  } catch (err) {
    if (err.response?.data?.error === 'payment_not_found') {
      return res.status(404).json({ status: 'not_found' });
    }
    res.status(500).json({ error: 'Failed to check status', details: err.message });
  }
};

export const verifyRewardedAd = async (req, res) => {
  const { result } = req.body;
  const adId = result?.adId || result?.data?.adId || result?.ad_id;

  if (!adId) return res.status(400).json({ error: 'Missing adId', raw: result });

  try {
    const response = await axios.get(`${ADS_URL}/${adId}`, { headers: getHeaders() });
    const { ad } = response.data || {};

    if (ad?.mediator_ack_status === 'granted') {
      return res.status(200).json({ rewarded: true, ad });
    }

    res.status(403).json({ rewarded: false, reason: 'Not granted', ad });
  } catch (err) {
    res.status(500).json({ error: 'Ad verification failed', details: err.message });
  }
};

export const handleIncomplete = async (req, res) => {
  const { paymentId, txid } = req.body;
  res.status(200).json({ message: 'Logged incomplete payment', data: { paymentId, txid } });
};

export const logDebugInfo = async (req, res) => {
  console.log('🪵 DEBUG LOG:', req.body);
  res.status(200).json({ message: 'Debug logged' });
};
