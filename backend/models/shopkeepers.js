const mongoose = require('mongoose');

const shopkeeperSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  upiId: { type: String },
  whatsappNotifications: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema); 