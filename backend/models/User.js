// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    piUid: { type: String, required: true, unique: true },
    piUsername: { type: String, required: true },
    username: { type: String, required: true },
    authSource: { type: String, default: 'pi' },
    role: { type: String, default: 'user' },
    piCredits: { type: Number, default: 0 }, // ✅ Add this line
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
