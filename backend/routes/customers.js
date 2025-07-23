const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');
const shopkeeperAuth = require('../middleware/shopkeeperAuth');

// Get all customers (protected)
router.get('/', shopkeeperAuth, controller.getCustomers);

// Get customer by ID (protected)
router.get('/:id', shopkeeperAuth, controller.getCustomer);

// Create customer (protected)
router.post('/', shopkeeperAuth, controller.createCustomer);

// Update customer (protected)
router.put('/:id', shopkeeperAuth, controller.updateCustomer);

// Delete customer (protected)
router.delete('/:id', shopkeeperAuth, controller.deleteCustomer);

module.exports = router; 