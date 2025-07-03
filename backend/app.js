require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./modules/logger");
const middleware = require("./middleware");

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(logger.requestLogger);
app.use(middleware);

// Import routes
const customerRoutes = require("./routes/customers");
const salesRoutes = require("./routes/sales");
const notificationRoutes = require("./routes/notifications");
const shopkeeperRoutes = require("./routes/shopkeepers");
const debugRoutes = require("./routes/debug");

app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shopkeepers", shopkeeperRoutes);
app.use("/api/debug", debugRoutes);

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
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

// Connect to MongoDB (but don't make it blocking)
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    console.log("API will run with in-memory data instead of MongoDB");
  });

app.get("/", (req, res) => {
  res.send("Credit Pay API running");
});

module.exports = app;
