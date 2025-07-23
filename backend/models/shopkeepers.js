const mongoose = require('mongoose');

const shopkeeperSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  upiId: { type: String },
  whatsappNotifications: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema); 