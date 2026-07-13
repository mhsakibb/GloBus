# 🛒 GloBus - Full-Stack E-Commerce Platform

![GloBus Homepage](./Globus_FrontEnd/public/Images/image.png)

GloBus is a modern, feature-rich, and scalable e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless shopping experience for users with a clean UI, secure payments, and a powerful admin dashboard for store management.

## Features

### For Users

- **Browse & Search Products**: Categorized product browsing (Top Deals, New Arrivals, Food, Electronics, etc.).
- **Dark & Light Mode**: Seamlessly toggle between themes with persistent user preference using Tailwind CSS v4 and Context API.
- **Multi-language Support**: Fully localized interface using `i18next`.
- **Shopping Cart & Checkout**: Interactive cart management and seamless checkout process.
- **Secure Payments**: Integrated with **SSLCommerz** for secure online transactions in Bangladesh.
- **Authentication**: Secure user signup, login, and profile management (Firebase Auth & custom JWT).
- **Newsletter Subscription**: Keep up with the latest deals and offers.

### For Admins

- **Product Management**: Full CRUD operations for products (Add, Update, Delete).
- **Order Management**: View all orders, update statuses, and analyze order statistics.
- **User Management**: View user lists, toggle active status, or delete users.

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **State/Routing**: React Router DOM
- **Internationalization**: i18next, react-i18next
- **HTTP Client**: Axios
- **BaaS/Auth**: Firebase

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Native Driver)
- **Payment Gateway**: SSLCommerz (`sslcommerz-lts`)
- **Other Utilities**: Multer (File Uploads), Bcrypt (Password Hashing), CORS, Dotenv

# Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Connection URI
- Firebase Project setup
- SSLCommerz Sandbox/Live Store ID & Password

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/GloBus.git
   cd GloBus
   ```

2. **Environment Variables Setup:**

   Create a `.env` file in the `Globus_Backend` directory:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```

   Create a `.env.local` file in the `Globus_FrontEnd` directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_API_URL=http://localhost:5000
   ```

3. **Install Dependencies:**
   From the root folder (`GloBus`), run the following command to install dependencies for both the frontend and backend simultaneously:

   ```bash
   npm run install:all
   ```

4. **Run the Application:**
   Start both the frontend and backend concurrently from the root folder:

   ```bash
   npm run dev
   ```

# Project Structure

```text
GloBus/
├── package.json        # Root package to run concurrently
├── Globus_FrontEnd/    # React/Vite Frontend
│   ├── src/            # Components, Pages, Assets
│   ├── package.json    # Frontend dependencies
│   └── vite.config.js  # Vite configuration
│
└── Globus_Backend/     # Node.js/Express Backend
    ├── Controllers/    # Business logic (User, Product, Order, Payment)
    ├── server.js       # Entry point & Routes
    └── package.json    # Backend dependencies
```
