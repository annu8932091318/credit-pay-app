const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  totalOwed: { type: Number, default: 0 },
  lastTransactionDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema); 