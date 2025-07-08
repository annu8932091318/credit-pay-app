require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/users');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/credit-pay';

async function showUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find().select('-password');
    
    console.log(`Total users: ${users.length}`);
    console.log('\nUser data:');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n--- User ${index + 1} ---`);
        console.log(`ID: ${user._id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Phone: ${user.phone}`);
        console.log(`Shop Name: ${user.shopName || 'Not specified'}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created: ${user.createdAt}`);
      });
    }
    
    // Close connection
    await mongoose.disconnect();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error fetching users:', error);
    if (mongoose.connection) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

showUsers();