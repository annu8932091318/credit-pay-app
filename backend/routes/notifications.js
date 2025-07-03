const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// Get all notifications
router.get('/', controller.getNotifications);

// Create notification
router.post('/', controller.createNotification);

// Update notification
router.put('/:id', controller.updateNotification);

// Delete notification
router.delete('/:id', controller.deleteNotification);

// Send OTP
router.post('/send-otp', controller.sendOTP);

// Verify OTP
router.post('/verify-otp', controller.verifyOTP);

module.exports = router; 