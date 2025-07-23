const mongoose = require('mongoose');
const mockData = require('../modules/mockData');

// Always use real MongoDB models
module.exports = {
  Customer: require('./customers'),
  Sale: require('./sales'),
  Notification: require('./notifications'),
  Shopkeeper: require('./shopkeepers'),
  Receipt: require('./receipts')
};