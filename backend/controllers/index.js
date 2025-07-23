// Bypass OTP verification: always succeed
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // Accept any OTP for any phone
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    // Always succeed
    res.json({ message: 'OTP verified successfully', phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const { Customer, Sale, Notification, Shopkeeper } = require('../models');
const common = require('./commonFunctions');

// --- Customers ---
exports.getCustomers = async (req, res) => {
  try {
    // Only return customers for the logged-in shopkeeper
    const shopkeeperId = req.user?._id || req.user?.id;
    if (!shopkeeperId) {
      return res.status(401).json({ error: 'Unauthorized: No shopkeeper ID found in request.' });
    }
    let customers;
    try {
      customers = await Customer.find({ shopkeeper: shopkeeperId }).sort({ lastTransactionDate: -1 });
    } catch (sortError) {
      console.log('Sort failed, falling back to unsorted list:', sortError.message);
      customers = await Customer.find({ shopkeeper: shopkeeperId });
    }
    console.log(`DEBUG: Found ${customers.length} customers for shopkeeper ${shopkeeperId}`);
    const formattedCustomers = customers.map(customer => {
      const customerObj = customer.toObject ? customer.toObject() : customer;
      return {
        ...customerObj,
        totalOwed: customerObj.totalOwed || 0,
        lastTransactionDate: customerObj.lastTransactionDate || null,
      };
    });
    res.json({ data: common.formatResponse(formattedCustomers) });
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
    // Only return sales for the logged-in shopkeeper
    const shopkeeperId = req.user?._id || req.user?.id;
    if (!shopkeeperId) {
      return res.status(401).json({ error: 'Unauthorized: No shopkeeper ID found in request.' });
    }
    // Find sales where the customer belongs to this shopkeeper
    const customers = await Customer.find({ shopkeeper: shopkeeperId }).select('_id');
    const customerIds = customers.map(c => c._id);
    const sales = await Sale.find({ customer: { $in: customerIds } }).populate('customer').sort({ date: -1 });
    console.log(`Found ${sales.length} sales for shopkeeper ${shopkeeperId}`);
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
    // Generate OTP (not used, but log for dev)
    const otp = generateOTP();
    otpStore[phone] = {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
    console.log(`DEBUG: OTP for ${phone} is ${otp}`);
    res.json({ message: 'OTP sent successfully', phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}