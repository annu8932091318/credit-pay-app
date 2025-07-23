
const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');
// --- Custom Shopkeeper Auth Logic ---
// OTP login for shopkeeper (dev mode: accepts any OTP)
// POST /api/shopkeeper/otp-login
router.post('/otp-login', async (req, res) => {
  try {
    let { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    // Normalize phone: remove all non-digits, take last 10 digits
    phone = String(phone).replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    // Find shopkeeper by normalized phone
    const Shopkeeper = require('../models/shopkeepers');
    const shopkeeper = await Shopkeeper.findOne({ phone });
    if (!shopkeeper) {
      return res.status(400).json({ error: 'No shopkeeper found for this phone number' });
    }
    // Accept any OTP (dev mode)
    // Issue JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ shopkeeperId: shopkeeper._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      shopkeeper: {
        id: shopkeeper._id,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
        email: shopkeeper.email,
        upiId: shopkeeper.upiId,
        whatsappNotifications: shopkeeper.whatsappNotifications
      }
    });
  } catch (err) {
    console.error('OTP login error:', err);
    res.status(500).json({ error: 'Server error during OTP login' });
  }
});

// Register a new shopkeeper
// POST /api/shopkeeper/register
router.post('/register', async (req, res) => {
  try {
    let { shopName, phone, email, password, upiId } = req.body;
    if (!shopName || !phone || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    // Normalize phone: remove all non-digits, take last 10 digits
    phone = String(phone).replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    const Shopkeeper = require('../models/shopkeepers');
    let existing = await Shopkeeper.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Shopkeeper already exists' });
    }
    const hashedPassword = await require('bcryptjs').hash(password, 10);
    const shopkeeper = new Shopkeeper({
      shopName,
      phone,
      email,
      password: hashedPassword,
      upiId
    });
    await shopkeeper.save();
    // Issue JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ shopkeeperId: shopkeeper._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Shopkeeper registered successfully',
      token,
      shopkeeper: {
        id: shopkeeper._id,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
        email: shopkeeper.email,
        upiId: shopkeeper.upiId,
        whatsappNotifications: shopkeeper.whatsappNotifications
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// Login shopkeeper by email and password
// POST /api/shopkeeper/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const Shopkeeper = require('../models/shopkeepers');
    const shopkeeper = await Shopkeeper.findOne({ email });
    if (!shopkeeper) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await require('bcryptjs').compare(password, shopkeeper.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // Issue JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ shopkeeperId: shopkeeper._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      shopkeeper: {
        id: shopkeeper._id,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
        email: shopkeeper.email,
        upiId: shopkeeper.upiId,
        whatsappNotifications: shopkeeper.whatsappNotifications
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get all shopkeepers
router.get('/', controller.getShopkeepers);

// Get shopkeeper by ID
router.get('/:id', controller.getShopkeeper);

// Create shopkeeper
router.post('/', controller.createShopkeeper);

// Update shopkeeper
router.put('/:id', controller.updateShopkeeper);

// Delete shopkeeper
router.delete('/:id', controller.deleteShopkeeper);

module.exports = router;