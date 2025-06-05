// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: String, required: true },
    txid: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    memo: { type: String },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);