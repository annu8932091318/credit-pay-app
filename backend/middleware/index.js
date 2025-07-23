const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// const { authenticateUser } = require('./auth');
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
  
  // All authentication middleware removed. All routes are now public.
};

module.exports = setupMiddleware;