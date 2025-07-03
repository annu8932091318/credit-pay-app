const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  notes: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema); 