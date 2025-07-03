const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

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