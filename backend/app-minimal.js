require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Simple route to test the server
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Credit Pay API is running" });
});

// Import routes
const customerRoutes = require("./routes/customers");
const salesRoutes = require("./routes/sales");
const shopkeeperRoutes = require("./routes/shopkeepers");

app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/shopkeepers", shopkeeperRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/credit-pay";

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
