const Razorpay = require('razorpay');
const crypto = require('crypto');
const Sale = require('../../models/sales');
const Customer = require('../../models/customers');

// Initialize Razorpay instance if keys are available
let razorpay;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully');
  } else {
    console.log('Razorpay credentials missing. Payment gateway features will not work.');
  }
} catch (error) {
  console.error(`Failed to initialize Razorpay: ${error.message}`);
}

/**
 * Create a new payment order with Razorpay
 * @param {Object} data Payment details
 * @returns {Object} Payment order details
 */
const createPaymentOrder = async (data) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Payment gateway not configured. Please check server configuration.'
      };
    }

    const { amount, currency = 'INR', receipt, notes } = data;

    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise)
      currency,
      receipt,
      notes
    };

    const order = await razorpay.orders.create(options);
    console.log(`Payment order created: ${order.id}`);
    
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error(`Failed to create payment order: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} data Payment verification data
 * @returns {Boolean} Whether signature is valid
 */
const verifyPaymentSignature = (data) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Cannot verify payment: Razorpay key secret is missing');
      return false;
    }
    
    const { orderId, paymentId, signature } = data;
    
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error(`Error verifying payment signature: ${error.message}`);
    return false;
  }
};

/**
 * Process payment confirmation and update records
 * @param {Object} data Payment confirmation data
 * @returns {Object} Updated sale and customer data
 */
const processPaymentSuccess = async (data) => {
  try {
    const { 
      saleId, 
      paymentId, 
      orderId, 
      signature, 
      amount, 
      paymentMethod = 'RAZORPAY' 
    } = data;

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isValidSignature) {
      return {
        success: false,
        error: 'Invalid payment signature'
      };
    }

    // Get payment details from Razorpay if available
    let paymentDetails = {};
    if (razorpay) {
      try {
        paymentDetails = await razorpay.payments.fetch(paymentId);
      } catch (err) {
        console.warn(`Could not fetch payment details: ${err.message}`);
      }
    }
    
    // Update sale record
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      {
        status: 'PAID',
        payment: {
          transactionId: paymentId,
          paymentMethod,
          paymentDate: new Date(),
          gatewayResponse: paymentDetails,
          receiptUrl: paymentDetails.receipt_url || ''
        }
      },
      { new: true }
    ).populate('customer');

    if (!sale) {
      return {
        success: false,
        error: 'Sale not found'
      };
    }

    // Update customer's payment history and reduce totalOwed
    const customer = await Customer.findById(sale.customer._id);
    
    if (customer) {
      customer.paymentHistory.push({
        saleId: sale._id,
        amount,
        date: new Date()
      });

      customer.totalOwed -= amount;
      customer.lastTransactionDate = new Date();

      await customer.save();
    }

    console.log(`Payment processed successfully for sale ${saleId}, payment ID: ${paymentId}`);
    
    return {
      success: true,
      sale,
      customer
    };
  } catch (error) {
    console.error(`Failed to process payment success: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all payment methods available
 */
const getPaymentMethods = () => {
  return {
    success: true,
    methods: [
      { id: 'RAZORPAY', name: 'Online Payment (Card/UPI)', isOnline: true },
      { id: 'UPI', name: 'Direct UPI Transfer', isOnline: true },
      { id: 'CASH', name: 'Cash Payment', isOnline: false },
      { id: 'BANK_TRANSFER', name: 'Bank Transfer', isOnline: true }
    ]
  };
};

/**
 * Process manual payment update (for cash payments)
 */
const processManualPayment = async (data) => {
  try {
    const { 
      saleId, 
      amount, 
      paymentMethod,
      notes 
    } = data;
    
    // Update sale record
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      {
        status: 'PAID',
        payment: {
          paymentMethod,
          paymentDate: new Date(),
          notes
        }
      },
      { new: true }
    ).populate('customer');

    if (!sale) {
      return {
        success: false,
        error: 'Sale not found'
      };
    }

    // Update customer's payment history and reduce totalOwed
    const customer = await Customer.findById(sale.customer._id);
    
    if (customer) {
      customer.paymentHistory.push({
        saleId: sale._id,
        amount,
        date: new Date()
      });

      customer.totalOwed -= amount;
      customer.lastTransactionDate = new Date();

      await customer.save();
    }

    console.log(`Manual payment processed successfully for sale ${saleId}`);
    
    return {
      success: true,
      sale,
      customer
    };
  } catch (error) {
    console.error(`Failed to process manual payment: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentSignature,
  processPaymentSuccess,
  getPaymentMethods,
  processManualPayment
};
