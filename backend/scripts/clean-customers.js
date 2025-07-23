// Run this script with: node backend/scripts/clean-customers.js
const path = require('path');
const mongoose = require('mongoose');
const Customer = require('../models/customers');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function clean() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await Customer.deleteMany({});
    console.log(`Deleted ${result.deletedCount} customers from the database.`);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting customers:', err);
    process.exit(1);
  }
}

clean();
