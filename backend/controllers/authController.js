import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import User from '../models/User.js';

dotenv.config();

export const piLogin = async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing Pi access token' });
  }

  try {
    const { data } = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const uid = data?.uid;
    const username = data?.username;

    if (!uid || !username) {
      return res.status(401).json({ error: 'Invalid Pi authentication' });
    }

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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        piUsername: user.piUsername,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Pi Login Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Pi login failed' });
  }
};
