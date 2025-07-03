const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Other"], required: true },
  receiptNumber: { type: String, unique: true },
  notes: { type: String },
  paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Generate a unique receipt number before saving
receiptSchema.pre("save", async function(next) {
  if (this.isNew && !this.receiptNumber) {
    const count = await mongoose.model("Receipt").countDocuments();
    const prefix = "RCP";
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const uniqueNum = (count + 1).toString().padStart(4, "0");
    this.receiptNumber = `${prefix}${year}${month}${uniqueNum}`;
  }
  next();
});

module.exports = mongoose.model("Receipt", receiptSchema);
