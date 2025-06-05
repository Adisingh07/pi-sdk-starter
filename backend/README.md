pi-sdk-backend/
├── controllers/
│   ├── authController.js
│   ├── piPaymentController.js
│   └── rewardController.js
│
├── models/
│   ├── User.js
│   └── Transaction.js
│
├── routes/
│   ├── authRoutes.js
│   ├── piPayments.js
│   └── rewardRoutes.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── .env.example
├── package.json
├── README.md
└── server.js
// README.md
# Pi SDK Backend Starter

A minimal backend template for integrating Pi Network login, payments, and rewards.

## 🚀 Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Pi Network SDK (client-side)

## 🔐 Features
- Pi login via access token
- Payment approval + completion
- Basic Pi credit reward system (Mainnet only)

## 📦 Setup
```bash
git clone https://github.com/xCross/pi-sdk-backend.git
cd pi-sdk-backend
npm install
cp .env.example .env
```

Edit `.env` with your values.
Example `.env` values 
PORT=5000
MONGO_URI=mongodb://localhost:27017/pi-sdk-db
JWT_SECRET=your_jwt_secret
PI_API_KEY=your_pi_api_key

## ▶️ Run it
```bash
npm run dev   # dev with nodemon
npm start     # production
```

## 🔌 API Endpoints
| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| POST   | /api/auth/pi-login   | Login with Pi token   |
| GET    | /api/auth/profile    | Get user profile      |
| PATCH  | /api/auth/update-profile | Update username  |
| DELETE | /api/auth/delete-account | Delete user       |
| POST   | /api/payments/approve    | Approve payment |
| POST   | /api/payments/complete   | Complete payment |
| POST   | /api/reward/credit       | Add Pi credit     |

---

Built by @xcross for the Pi devs community 💜