import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import User from '../models/User.js';

dotenv.config();

export const piLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ success: false, error: 'Pi access token is required' });
    }

    // Verify Pi user using Pi Network API
    const { data } = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const uid = data?.uid;
    const username = data?.username;

    if (!uid || !username) {
      return res.status(401).json({ success: false, error: 'Invalid Pi authentication data' });
    }

    // Check if user exists, else create new
    let user = await User.findOne({ piUid: uid });

    if (!user) {
      user = await User.create({
        piUid: uid,
        piUsername: username,
        username,
        authSource: 'pi',
        role: 'user',
      });
    }

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        piUsername: user.piUsername,
        username: user.username,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('❌ Pi Login Error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Pi login failed. Please try again later.' });
  }
};
