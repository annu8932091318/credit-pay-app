const express = require('express');
const router = express.Router();

const controller = require('../controllers/index');
const shopkeeperAuth = require('../middleware/shopkeeperAuth');

// Get all sales (protected)
router.get('/', shopkeeperAuth, controller.getSales);

// Get sale by ID (protected)
router.get('/:id', shopkeeperAuth, controller.getSale);

// Create sale (protected)
router.post('/', shopkeeperAuth, controller.createSale);

// Update sale (protected)
router.put('/:id', shopkeeperAuth, controller.updateSale);

// Delete sale (protected)
router.delete('/:id', shopkeeperAuth, controller.deleteSale);

module.exports = router; 