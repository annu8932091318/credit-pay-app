require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/users');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/credit-pay';

async function cleanUsersData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    console.log('Deleting all user records...');
    
    // Delete all documents from the users collection
    const result = await User.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} user records`);
    console.log('User data cleanup complete!');
    
    // Close connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error cleaning user data:', error);
    if (mongoose.connection) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

cleanUsersData();