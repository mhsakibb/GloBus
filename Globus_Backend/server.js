require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const {
  signupUser,
  signinUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("./Controllers/userController");
const {
  createAdmin,
  getRole,
  showUsers,
  deleteUser,
  toggleUserStatus,
} = require("./Controllers/AdminController");

const {
  browseProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./Controllers/productController");

const { getProductById } = require("./Controllers/searchController");
const { subscribeNewsletter } = require("./Controllers/NewsletterController");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("./Controllers/cartController");

const {
  initSSLCommerz,
  handleIPN,
  paymentSuccess,
  paymentFailed,
  paymentCancel,
  getUserOrders,
} = require("./Controllers/PaymentController");

// Import order controllers
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
} = require("./Controllers/orderController");

const { chatWithBot } = require("./Controllers/chatbotController");
const { visionSearch } = require("./Controllers/visionController");

const app = express();

// 1. Universal CORS Configuration (Placed first to handle all pre-flight OPTIONS requests)
app.use(
  cors({
    origin: true, // Automatically reflect request origin (supports localhost:5173, 5174, vercel domains, etc.)
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Cache"],
  })
);

// 2. Security Headers with Helmet (Configured to not block cross-origin media/APIs)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// 3. High-Performance Gzip/Brotli Compression
app.use(compression());

// 4. Rate Limiting Protection
// General API Limiter: 300 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", generalLimiter);

// Auth Limiter: 15 attempts per 15 minutes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login/signup attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Endpoints Limiter: 30 requests per minute to prevent quota exhaustion
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { message: "AI assistant is busy. Please wait a moment before sending more queries." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Body Parsing with Safe Payload Size Constraints
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

app.locals.mongoClient = client;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    // Create default admin if not exists
    await createAdmin(client.db("globusDB"));

    // Role Route
    app.get("/getRole", getRole);

    // Auth Routes with Rate Limiting
    app.post("/signup", authLimiter, signupUser);
    app.post("/signin", authLimiter, signinUser);
    app.post("/api/auth/forgot-password", authLimiter, forgotPassword);
    app.post("/api/auth/verify-reset-code", authLimiter, verifyResetCode);
    app.post("/api/auth/reset-password", authLimiter, resetPassword);
    app.post("/forgot-password", authLimiter, forgotPassword);
    app.post("/reset-password", authLimiter, resetPassword);

    // Admin User Management Routes
    app.get("/admin/users", showUsers);
    app.delete("/admin/user/:id", deleteUser);
    app.patch("/admin/user/:id/status", toggleUserStatus);

    // Admin Products Routes
    app.post("/addProducts", createProduct);
    app.put("/products/:id", updateProduct);
    app.delete("/products/:id", deleteProduct);

    // General Products Routes
    app.get("/browseProduct", browseProduct);
    app.get("/productDetail/:id", getProductById);

    // Order & Payment History Routes
    app.get("/api/orders", getUserOrders);

    // Newsletter Route
    app.post("/api/newsletter/subscribe", subscribeNewsletter);

    // Chatbot & Vision Routes with AI Rate Limiting
    app.post("/api/chat", aiLimiter, chatWithBot);
    app.post("/api/vision-search", aiLimiter, visionSearch);

    // Cart Routes
    app.post("/cart/add", addToCart);
    app.get("/cart/:userId", getCart);
    app.put("/cart/update/:cartItemId", updateCartQuantity);
    app.delete("/cart/remove/:cartItemId", removeFromCart);
    app.delete("/cart/clear/:userId", clearCart);

    // SSL Commerz Payment Routes
    app.post("/api/sslcommerz/init", initSSLCommerz);
    app.post("/api/sslcommerz/ipn", handleIPN);
    app.post("/api/sslcommerz/success/:tran_id", paymentSuccess);
    app.get("/api/sslcommerz/success/:tran_id", paymentSuccess);
    app.post("/api/sslcommerz/fail/:tran_id", paymentFailed);
    app.get("/api/sslcommerz/fail/:tran_id", paymentFailed);
    app.post("/api/sslcommerz/cancel/:tran_id", paymentCancel);
    app.get("/api/sslcommerz/cancel/:tran_id", paymentCancel);

    // Admin Order Management Routes
    app.get("/api/orders/all", getAllOrders);
    app.get("/api/orders/stats", getOrderStats);
    app.get("/api/orders/:id", getOrderById);
    app.patch("/api/orders/:id/status", updateOrderStatus);
    app.delete("/api/orders/:id", deleteOrder);

    // Health check route
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Globus Enterprise Backend is running smoothly!",
        timestamp: new Date().toISOString(),
      });
    });

    // Centralized Error Handling Middleware
    app.use((err, req, res, next) => {
      console.error("Global Server Error:", err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    });

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas:", err);
  }
}

run();