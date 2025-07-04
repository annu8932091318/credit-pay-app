const jwt = require('jsonwebtoken');
const User = require('../models/users');

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

/**
 * Role-based authorization middleware
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action' 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles
};
