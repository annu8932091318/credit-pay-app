const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// Get all customers
router.get('/', controller.getCustomers);

// Get customer by ID
router.get('/:id', controller.getCustomer);

// Create customer
router.post('/', controller.createCustomer);

// Update customer
router.put('/:id', controller.updateCustomer);

// Delete customer
router.delete('/:id', controller.deleteCustomer);

module.exports = router; 