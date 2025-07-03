const { Customer, Sale, Notification, Shopkeeper } = require('../models');
const common = require('./commonFunctions');

// --- Customers ---
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastTransactionDate: -1 });
    console.log(`Found ${customers.length} customers in the database`);
    
    // Ensure we return appropriate data
    const formattedCustomers = customers.map(customer => {
      const customerObj = customer.toObject();
      return {
        ...customerObj,
        totalOwed: customerObj.totalOwed || 0,
        lastTransactionDate: customerObj.lastTransactionDate || null,
      };
    });
    
    res.json(common.formatResponse(formattedCustomers));
  } catch (err) {
    console.error('Error in getCustomers:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(common.formatResponse(customer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(common.formatResponse(customer));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(common.formatResponse(customer));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(common.formatResponse({ message: 'Customer deleted' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Sales ---
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('customer').sort({ date: -1 });
    console.log(`Found ${sales.length} sales in the database`);
    
    // Format sales data to include both customer and customerId for backward compatibility
    const formattedSales = sales.map(sale => {
      const saleObj = sale.toObject();
      return {
        ...saleObj,
        customerId: saleObj.customer._id, // Add customerId for backward compatibility
        // Keep the populated customer object
      };
    });
    
    res.json(common.formatResponse(formattedSales));
  } catch (err) {
    console.error('Error in getSales:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer');
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(common.formatResponse(sale));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(common.formatResponse(sale));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(common.formatResponse(sale));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(common.formatResponse({ message: 'Sale deleted' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Notifications ---
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate('customer').sort({ createdAt: -1 });
    res.json(common.formatResponse(notifications));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(common.formatResponse(notification));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(common.formatResponse(notification));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(common.formatResponse({ message: 'Notification deleted' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Shopkeepers ---
exports.getShopkeepers = async (req, res) => {
  try {
    const shopkeepers = await Shopkeeper.find();
    res.json(common.formatResponse(shopkeepers));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id);
    if (!shopkeeper) return res.status(404).json({ error: 'Shopkeeper not found' });
    res.json(common.formatResponse(shopkeeper));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createShopkeeper = async (req, res) => {
  try {
    const shopkeeper = new Shopkeeper(req.body);
    await shopkeeper.save();
    res.status(201).json(common.formatResponse(shopkeeper));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shopkeeper) return res.status(404).json({ error: 'Shopkeeper not found' });
    res.json(common.formatResponse(shopkeeper));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findByIdAndDelete(req.params.id);
    if (!shopkeeper) return res.status(404).json({ error: 'Shopkeeper not found' });
    res.json(common.formatResponse({ message: 'Shopkeeper deleted' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// OTP generation and storage
const otpStore = {}; // In-memory OTP storage (replace with database in production)

// Generate a random 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration time (5 minutes)
    otpStore[phone] = {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    };
    
    // In a production app, you would send the OTP via SMS/WhatsApp
    console.log(`OTP for ${phone}: ${otp}`); // Log for testing purposes
    
    // Create notification entry
    // For a real implementation, you would create a notification after sending the OTP
    // Currently just simulating success
    
    res.json(common.formatResponse({ 
      message: 'OTP sent successfully', 
      phone,
      // Include the OTP in response only for development/testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // Validate phone number and OTP
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }
    
    // Check if OTP exists and is valid
    const storedOTPData = otpStore[phone];
    if (!storedOTPData) {
      return res.status(400).json({ error: 'No OTP sent for this phone number' });
    }
    
    // Check if OTP is expired
    if (new Date() > storedOTPData.expiresAt) {
      delete otpStore[phone]; // Clean up expired OTP
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    // Check if OTP matches
    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP is valid - clean up
    delete otpStore[phone];
    
    res.json(common.formatResponse({ message: 'OTP verified successfully', phone }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller exports are handled through individual function exports