const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'PENDING', 'FAILED'], default: 'PENDING' },
  type: { type: String, enum: ['OTP', 'PAYMENT_REMINDER', 'RECEIPT'], required: true },
  channel: { type: String, enum: ['whatsapp', 'sms', 'email'], default: 'whatsapp' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 