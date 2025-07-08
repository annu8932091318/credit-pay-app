require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/credit-pay';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Collections found:', collectionNames);
    
    // Ask for confirmation
    rl.question('Are you sure you want to delete all data from these collections? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        // Drop collections
        console.log('Cleaning database...');
        
        for (const name of collectionNames) {
          try {
            await mongoose.connection.db.collection(name).deleteMany({});
            console.log(`Cleared all documents from ${name}`);
          } catch (error) {
            console.error(`Error clearing collection ${name}:`, error);
          }
        }
        
        console.log('Database clean complete!');
      } else {
        console.log('Operation cancelled');
      }
      
      // Close connections and exit
      mongoose.disconnect();
      rl.close();
    });
  } catch (error) {
    console.error('Error cleaning database:', error);
    mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
}

cleanDatabase();