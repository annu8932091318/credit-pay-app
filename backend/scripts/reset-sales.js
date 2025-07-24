import mongoose from 'mongoose';
import Sale from '../models/sales.js'; // Correct path for Sale model

async function resetSales() {
  await mongoose.connect('mongodb://localhost:27017/credit-pay'); // Use correct DB name from .env

  // Remove all sales
  await Sale.deleteMany({});
  console.log('All sales deleted!');
  process.exit(0);
}

resetSales();