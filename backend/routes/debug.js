const express = require('express');
const router = express.Router();
const models = require('../models');
const mongoose = require('mongoose');

// Get database status
router.get('/db-status', (req, res) => {
  const status = {
    mongoConnected: models.isConnected,
    mongoState: mongoose.connection.readyState,
    mongoStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    usesMockData: !models.isConnected,
    mongoHost: process.env.MONGO_URI || 'Not configured'
  };
  
  res.json(status);
});

// Get database statistics
router.get('/db-stats', async (req, res) => {
  try {
    let stats = {};
    
    // Count models
    const customerCount = await models.Customer.countDocuments ? 
      await models.Customer.countDocuments() : 
      (await models.Customer.find()).length;
      
    const saleCount = await models.Sale.countDocuments ? 
      await models.Sale.countDocuments() :
      (await models.Sale.find()).length;
      
    const notificationCount = await models.Notification.countDocuments ? 
      await models.Notification.countDocuments() : 
      (await models.Notification.find()).length;
      
    const shopkeeperCount = await models.Shopkeeper.countDocuments ? 
      await models.Shopkeeper.countDocuments() : 
      (await models.Shopkeeper.find()).length;
    
    stats = {
      customers: customerCount,
      sales: saleCount,
      notifications: notificationCount,
      shopkeepers: shopkeeperCount
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching DB stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clean database - DEVELOPMENT ONLY
router.post('/clean-db', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }

  try {
    if (models.isConnected) {
      // MongoDB connected, use deleteMany
      await models.Customer.deleteMany({});
      await models.Sale.deleteMany({});
      await models.Notification.deleteMany({});
      await models.Shopkeeper.deleteMany({});
      await models.Receipt.deleteMany({});
    } else {
      // Using mock data, reset the arrays
      const mockData = require('../modules/mockData');
      mockData.customers = [];
      mockData.sales = [];
      mockData.notifications = [];
      mockData.shopkeepers = [];
      mockData.receipts = [];
    }
    
    res.json({ message: 'Database cleaned successfully' });
  } catch (error) {
    console.error('Error cleaning DB:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;