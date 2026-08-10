require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { signupUser, signinUser } = require("./Controllers/userController");
const {
  createAdmin,
  getRole,
  showUsers,
  deleteUser,
  toggleUserStatus
} = require("./Controllers/AdminController");

const {
  browseProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("./Controllers/productController");

const { getProductById } = require("./Controllers/searchController");
const { subscribeNewsletter } = require("./Controllers/NewsletterController");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} = require("./Controllers/cartController");

const { initSSLCommerz,
  handleIPN,
  paymentSuccess,
  paymentFailed,
  paymentCancel,
  getUserOrders
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
const cors = require("cors");

// CORS setup for your domains
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://glo-bus-virid.vercel.app",
    "https://glo-bus-virid.vercel.app/"
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

    // Create admin
    await createAdmin(client.db("globusDB"));

    // Role Route
    app.get("/getRole", getRole);

    // Auth Route
    app.post("/signup", signupUser);
    app.post("/signin", signinUser);

    // Admin User Management Route
    app.get("/admin/users", showUsers);
    app.delete("/admin/user/:id", deleteUser);
    app.patch("/admin/user/:id/status", toggleUserStatus);

    // Admin Products Route
    app.post("/addProducts", createProduct);
    app.put("/products/:id", updateProduct);
    app.delete("/products/:id", deleteProduct);

    // General Products Route
    app.get("/browseProduct", browseProduct);
    app.get("/productDetail/:id", getProductById);

    // Order & Payment History Routes
    app.get("/api/orders", getUserOrders);

    // NewsLetter
    app.post("/api/newsletter/subscribe", subscribeNewsletter);

    // Chatbot & Vision Route
    app.post("/api/chat", chatWithBot);
    app.post("/api/vision-search", visionSearch);

    // Cart Route
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
    app.get("/api/orders", getUserOrders);

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
        message: "Globus Backend is running!",
        timestamp: new Date().toISOString()
      });
    });

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
  }
}

run().catch(console.dir); 