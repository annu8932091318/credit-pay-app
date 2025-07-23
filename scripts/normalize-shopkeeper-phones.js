// Script to normalize all shopkeeper phone numbers in the database to 10 digits
// Usage: node scripts/normalize-shopkeeper-phones.js

const mongoose = require('mongoose');
const Shopkeeper = require('../backend/models/shopkeepers');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/credit-pay-app';

async function normalizePhones() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const shopkeepers = await Shopkeeper.find({});
  let updated = 0;
  for (const s of shopkeepers) {
    const normalized = String(s.phone).replace(/\D/g, '').slice(-10);
    if (normalized.length === 10 && s.phone !== normalized) {
      s.phone = normalized;
      await s.save();
      updated++;
      console.log(`Updated: ${s.email} -> ${normalized}`);
    }
  }
  console.log(`Done. Updated ${updated} shopkeeper phone numbers.`);
  await mongoose.disconnect();
}

normalizePhones().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
