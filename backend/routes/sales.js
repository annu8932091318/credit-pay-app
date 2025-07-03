const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// Get all sales
router.get('/', controller.getSales);

// Get sale by ID
router.get('/:id', controller.getSale);

// Create sale
router.post('/', controller.createSale);

// Update sale
router.put('/:id', controller.updateSale);

// Delete sale
router.delete('/:id', controller.deleteSale);

module.exports = router; 