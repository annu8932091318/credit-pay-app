const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE', 'CANCELLED'], 
    default: 'PENDING' 
  },
  notes: { type: String },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
  reminders: [{
    sentAt: Date,
    channel: { type: String, enum: ['SMS', 'WHATSAPP', 'EMAIL'] },
    status: { type: String, enum: ['SENT', 'FAILED', 'DELIVERED'] }
  }],
  payment: {
    transactionId: String,
    paymentMethod: { type: String, enum: ['CASH', 'RAZORPAY', 'BANK_TRANSFER', 'UPI'] },
    paymentDate: Date,
    gatewayResponse: Object,
    receiptUrl: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema); 