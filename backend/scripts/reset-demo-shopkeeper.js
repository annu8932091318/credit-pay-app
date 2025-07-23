// Run this script to reset and register a demo shopkeeper with a known password
const path = require('path');
const mongoose = require('mongoose');
const Shopkeeper = require('../models/shopkeepers');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');

async function resetDemoShopkeeper() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Shopkeeper.deleteMany({});
    const password = await bcrypt.hash('demo123', 10);
    const shopkeeper = new Shopkeeper({
      shopName: 'Demo Shop',
      phone: '9000000001',
      email: 'demo@shop.com',
      password,
      upiId: 'demo@upi',
      whatsappNotifications: true
    });
    await shopkeeper.save();
    console.log('Demo shopkeeper registered:');
    console.log({ email: shopkeeper.email, password: 'demo123' });
    process.exit(0);
  } catch (err) {
    console.error('Error in resetDemoShopkeeper:', err);
    process.exit(1);
  }
}

resetDemoShopkeeper();
