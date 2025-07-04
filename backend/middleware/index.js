const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { authenticateUser } = require('./auth');
const express = require('express');

const setupMiddleware = (app) => {
  // Security headers
  app.use(helmet());
  
  // Rate limiting - more generous for development
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased limit for development
    message: 'Too many requests from this IP, please try again later.'
  });
  
  // Apply rate limiting to all API routes
  app.use('/api/', apiLimiter);
  
  // Authentication paths that don't require auth
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/customers',
    '/api/customers/',
    '/api/sales',
    '/api/sales/',
    '/api/notifications',
    '/api/notifications/',
    '/api/shopkeepers',
    '/api/shopkeepers/',
    '/api/payments/methods',
    // Add other public paths as needed
  ];
  
  // Authentication middleware for protected routes
  app.use((req, res, next) => {
    // Skip authentication for public paths
    if (publicPaths.includes(req.path)) {
      return next();
    }
    
    // Check if route is for payment webhook (special case)
    if (req.path.includes('/api/payments/webhook')) {
      return next();
    }
    
    // Authenticate user for all other routes
    authenticateUser(req, res, next);
  });
};

module.exports = setupMiddleware;