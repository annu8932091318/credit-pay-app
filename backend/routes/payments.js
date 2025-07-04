const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const payments = require('../modules/payments');
const Sale = require('../models/sales');
const Customer = require('../models/customers');
const logger = require('../modules/logger');

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Create a new payment order
 * POST /api/payments/create-order
 */
router.post('/create-order', [
  body('saleId').isString().notEmpty(),
  body('amount').isNumeric().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const { saleId, amount } = req.body;

    // Find the sale
    const sale = await Sale.findById(saleId).populate('customer');
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Create order with Razorpay
    const result = await payments.createPaymentOrder({
      amount,
      currency: 'INR',
      receipt: `sale_${saleId}`,
      notes: {
        saleId,
        customerId: sale.customer._id.toString(),
        customerName: sale.customer.name,
        customerPhone: sale.customer.phone
      }
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(200).json({ order: result.order });
  } catch (error) {
    logger.error(`Error creating payment order: ${error.message}`);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/**
 * Verify and process payment success
 * POST /api/payments/verify
 */
router.post('/verify', [
  body('saleId').isString().notEmpty(),
  body('paymentId').isString().notEmpty(),
  body('orderId').isString().notEmpty(),
  body('signature').isString().notEmpty(),
  body('amount').isNumeric().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const { saleId, paymentId, orderId, signature, amount } = req.body;

    const result = await payments.processPaymentSuccess({
      saleId,
      paymentId,
      orderId,
      signature,
      amount
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      success: true,
      sale: result.sale,
      customer: result.customer
    });
  } catch (error) {
    logger.error(`Error verifying payment: ${error.message}`);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

/**
 * Get available payment methods
 * GET /api/payments/methods
 */
router.get('/methods', (req, res) => {
  try {
    const result = payments.getPaymentMethods();
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error getting payment methods: ${error.message}`);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

/**
 * Process manual payment (cash/direct transfers)
 * POST /api/payments/manual
 */
router.post('/manual', [
  body('saleId').isString().notEmpty(),
  body('amount').isNumeric().notEmpty(),
  body('paymentMethod').isString().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const { saleId, amount, paymentMethod, notes } = req.body;

    const result = await payments.processManualPayment({
      saleId,
      amount,
      paymentMethod,
      notes
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      success: true,
      sale: result.sale,
      customer: result.customer
    });
  } catch (error) {
    logger.error(`Error processing manual payment: ${error.message}`);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
