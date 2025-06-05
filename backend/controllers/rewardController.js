// controllers/rewardController.js
import User from '../models/User.js';

export const rewardPiCredit = async (req, res) => {
  const { piUsername } = req.body;

  if (!piUsername) {
    return res.status(400).json({ error: 'Missing piUsername' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { piUsername },
      { $inc: { piCredits: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Credit rewarded',
      balance: user.piCredits,
    });
  } catch (err) {
    console.error('❌ Reward error:', err.message);
    res.status(500).json({ error: 'Could not reward credit' });
  }
};
