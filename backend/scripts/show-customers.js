// Show all customers and their shopkeeper associations
const path = require('path');
const mongoose = require('mongoose');
const Customer = require('../models/customers');
const Shopkeeper = require('../models/shopkeepers');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function showCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const customers = await Customer.find().populate('shopkeeper');
    if (customers.length === 0) {
      console.log('No customers found in the database.');
    } else {
      customers.forEach(c => {
        console.log({
          id: c._id,
          name: c.name,
          shopkeeper: c.shopkeeper ? {
            id: c.shopkeeper._id,
            email: c.shopkeeper.email,
            shopName: c.shopkeeper.shopName
          } : null
        });
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error showing customers:', err);
    process.exit(1);
  }
}

showCustomers();
