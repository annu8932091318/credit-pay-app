const mongoose = require('mongoose');
const mockData = require('../modules/mockData');

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

let Customer, Sale, Notification, Shopkeeper, Receipt;

// Determine if we should use real models or mock data
if (isMongoConnected()) {
  console.log('Using MongoDB models');
  Customer = require('./customers');
  Sale = require('./sales');
  Notification = require('./notifications');
  Shopkeeper = require('./shopkeepers');
  Receipt = require('./receipts');
} else {
  console.log('Using mock data models');
  Customer = mockData.Customer;
  Sale = mockData.Sale;
  Notification = mockData.Notification;
  Shopkeeper = mockData.Shopkeeper;
  Receipt = mockData.Receipt;
}

// Export all models
module.exports = {
  Customer,
  Sale,
  Notification,
  Shopkeeper,
  Receipt,
  isConnected: isMongoConnected()
};