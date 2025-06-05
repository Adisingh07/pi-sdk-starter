import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import piPayments from './routes/piPayments.js';
import rewardRoutes from './routes/rewardRoutes.js'; // Only mount this on Mainnet
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// ✅ Middleware
app.use(express.json());
app.use(helmet());

// ❌ No cache for APIs
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourfrontend.com', // update to match your actual frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));



// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// ✅ Route Headers
app.use('/api', (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// ✅ Health check
app.get("/api", (req, res) => {
  res.status(200).json({ status: "OK", message: "Pi SDK Backend Live" });
});

// ✅ Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', piPayments);
app.use('/api/reward', rewardRoutes); // Optional: only mount on Mainnet

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Pi SDK Backend running on port ${PORT}`));
