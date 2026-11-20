# PRADEEP FRUITS AND VEGETABLES
### Premium 30-Minute Online Grocery Delivery Platform (Zepto / Blinkit Experience)

**Business Location:** Bhadradri Kothagudem, Telangana, India  
**Target Delivery Window:** 30 Minutes  
**Currency:** Indian Rupee (₹ / INR)  
**Timezone:** Asia/Kolkata  
**Primary Service Area:** Bhadradri Kothagudem Town and authorized surrounding zones  

---

## 🌟 Overview

**PRADEEP FRUITS AND VEGETABLES** is a high-performance commercial quick-commerce delivery platform built with the modern MERN stack + TypeScript. Inspired by the instant delivery mechanics of Zepto and Blinkit, it brings farm-fresh harvest, handpicked exotic fruits, crisp leafy greens, and daily grocery staples to customers across **Bhadradri Kothagudem** within 30 minutes.

Deliveries are personally orchestrated and tracked by the store admin without requiring complex third-party delivery aggregators.

---

## 🚀 Key Features

### 1. Zepto / Blinkit Inspired Frontend
- **Brand Identity:** Original fresh green and crisp white theme with smooth spring animations.
- **Location Selector:** Pincode validation and neighborhood selector for Bhadradri Kothagudem (Kothagudem Main Town, Writer Basti, Chunchupalli, Ramavaram, Rudrampur, Babu Camp, Vidyanagar, Palvancha).
- **Dynamic 30-Min Delivery Estimate:** Automatically factors in address distance, store preparation time, and live workload.
- **Shop by 7 Core Categories:**
  1. Fresh Vegetables
  2. Fresh Fruits
  3. Leafy Vegetables
  4. Organic Vegetables
  5. Seasonal Fruits
  6. Dry Fruits
  7. Daily Grocery Essentials
- **Multi-Unit Selection:** Full support for `250g`, `500g`, `1kg`, `1 piece`, `1 dozen`, `1 bunch`, and `1 packet`.
- **Live Search & Autocomplete:** Search in English and regional Telugu produce names (e.g., *టమోటా*, *పాలకూర*, *ఉల్లిపాయలు*).
- **Persistent Shopping Cart:** LocalStorage cached cart drawer with real-time bill breakdown, coupon applications (`WELCOME50`, `FRESH30`, `KOTHAGUDEM`), and free delivery threshold calculations.

### 2. Customer Accounts & Tracking
- **Authentication:** Customer registration & login with 10-digit Indian mobile number validation and JWT authentication.
- **Address Book:** Save multiple delivery addresses with landmark and recipient contact.
- **Live Order Tracking:** Real-time visual status updates via **Socket.IO** (Order Placed ➔ Confirmed ➔ Preparing ➔ Packed ➔ Out for Delivery ➔ Delivered).
- **Cancellation:** Customers can cancel eligible orders prior to store confirmation.
- **Tax Invoices:** Printable digital invoices with full breakdown and store license metadata.

### 3. Admin & Store Operations Dashboard
- **Protected Access:** Dedicated portal at `/admin/dashboard` protected by bcrypt hashed credentials and JWT tokens.
- **Live Statistics Overview:** Total orders, Today's orders, Pending active orders, Completed, Cancelled, Total customer reach, Revenue metrics, and Low-stock alerts.
- **Real-Time Order Feed:** Instant audio-visual chime and socket event when a customer places an order.
- **Direct Delivery Management:** Admin manages dispatch, delivery progress steps, and estimated time adjustments (+5m, +10m) personally.
- **WhatsApp Notification Integration:** 1-click WhatsApp customer communication template in Telugu and English.
- **Produce & Stock Inventory:** Add products, update prices, adjust stock levels inline, or mark items out of stock.
- **Delivery Zone Manager:** Enable/disable specific pincodes and areas in Bhadradri Kothagudem.
- **Coupon Manager:** Create and manage discount promotions with minimum order and max discount limits.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO Server, Multer |
| **Database** | MongoDB Atlas (Database: `pradeep_vegetables`) via Mongoose Models |
| **Authentication** | JWT (JSON Web Tokens), bcrypt.js |
| **Real-time Engine** | Socket.IO |
| **Payments** | Cash on Delivery (COD) + Razorpay Online Payments (UPI, Cards, NetBanking) |
| **Hosting & Deploy** | Vercel (Frontend Client) & Render (Backend Node API) |

---

## 📂 Project Structure

```
pradeep/
├── client/                     # Frontend React + Vite + TypeScript
│   ├── public/                 # Static assets (Favicons, SVG)
│   ├── src/
│   │   ├── components/         # Navbar, HeroBanners, CategorySlider, ProductCard, CartDrawer, etc.
│   │   ├── context/            # AuthContext, CartContext, LocationContext
│   │   ├── pages/              # HomePage, CheckoutPage, OrderTrackingPage, MyOrdersPage, Admin
│   │   ├── services/           # Axios API client & Socket.IO client
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── App.tsx             # Root application and route layout
│   │   └── main.tsx            # React DOM mounting
│   ├── index.html              # Branded HTML entrypoint
│   ├── tailwind.config.js      # Custom theme colours & styles
│   ├── tsconfig.json           # Frontend TypeScript configuration
│   └── vercel.json             # Vercel SPA routing rewrite rules
│
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # MongoDB connection & MemoryStore fallback
│   │   ├── controllers/        # Auth, Products, Orders, Admin, Coupons, ServiceAreas
│   │   ├── middleware/         # JWT verification & Multer uploads
│   │   ├── models/             # Mongoose schemas (User, Product, Order, Admin, etc.)
│   │   ├── routes/             # Express API routing
│   │   ├── scripts/            # Database seeder (seed.ts)
│   │   ├── services/           # Socket.IO & Razorpay service handlers
│   │   └── server.ts           # Server initialization and socket listeners
│   ├── tsconfig.json           # Backend TypeScript configuration
│   └── .env                    # Environment configuration
│
├── render.yaml                 # Render backend deployment manifest
└── package.json                # Workspace orchestration scripts
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pradeep_vegetables?retryWrites=true&w=majority
JWT_SECRET=pradeep_fruits_and_vegetables_jwt_secret_key_2026_kothagudem
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_YourKeyHere
RAZORPAY_KEY_SECRET=YourSecretHere
ADMIN_SECRET_KEY=PradeepAdmin2026Secure
TIMEZONE=Asia/Kolkata
BUSINESS_NAME=PRADEEP FRUITS AND VEGETABLES
BUSINESS_LOCATION=Bhadradri Kothagudem, Telangana, India
DEFAULT_DELIVERY_MINUTES=30
```

---

## 🏃 Local Development Quickstart

### 1. Install Dependencies
```bash
# In the root workspace
npm --prefix client install
npm --prefix server install
```

### 2. Seed Initial Database (Produce, Bhadradri Kothagudem zones, Admin)
```bash
npm --prefix server run seed
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend API (Port 5000)
npm run server

# Terminal 2: Frontend Client (Port 5173)
npm run client
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Default Admin Credentials
- **URL:** `http://localhost:5173/admin/login`
- **Username:** `admin` (or `admin@pradeepvegetables.com`)
- **Password:** `AdminPassword123!`

---

## 🚀 Production Deployment

### Frontend (Vercel)
1. Push this repository to GitHub.
2. In Vercel, import the repository and select `client` as the root directory.
3. Framework Preset: **Vite**.
4. Set Environment Variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`.
5. Deploy!

### Backend (Render)
1. In Render, select **New Web Service** and link your repo (or use `render.yaml`).
2. Root Directory: `server`.
3. Build Command: `npm install && npm run build`.
4. Start Command: `npm start`.
5. Add the Environment Variables from `server/.env`.
6. Deploy!
