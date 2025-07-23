require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");
const { expressCspHeader } = require("express-csp-header");
const { body, validationResult } = require("express-validator");
// Import without direct logger usage to avoid errors
const { requestLogger } = require("./modules/logger");
const middleware = require("./middleware");
const reminderService = require("./modules/reminders");

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Apply security headers
app.use(expressCspHeader({
  directives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "checkout.razorpay.com"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:"],
    'connect-src': ["'self'", "api.razorpay.com", "checkout.razorpay.com"],
    'frame-src': ["'self'", "checkout.razorpay.com"]
  }
}));

// Apply middleware setup
middleware(app);

// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const salesRoutes = require("./routes/sales");
const notificationRoutes = require("./routes/notifications");
const shopkeeperRoutes = require("./routes/shopkeepers");
const paymentRoutes = require("./routes/payments");
const debugRoutes = require("./routes/debug");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shopkeepers", shopkeeperRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/debug", debugRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/credit-pay";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      // Start payment reminder scheduler
      reminderService.startReminderScheduler();
    });
    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error("MONGO_URI used:", MONGO_URI);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Credit Pay API running");
});

module.exports = app;
