const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  whatsappNumber: { type: String },
  email: { type: String },
  totalOwed: { type: Number, default: 0 },
  lastTransactionDate: { type: Date },
  preferredContactMethod: { 
    type: String, 
    enum: ['SMS', 'WHATSAPP', 'EMAIL'],
    default: 'WHATSAPP'
  },
  paymentHistory: [{
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema); 