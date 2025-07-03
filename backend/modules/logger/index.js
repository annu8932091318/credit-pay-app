const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transports if needed
  ],
});

const requestLogger = (req, res, next) => {
  logger.info({
    message: 'HTTP Request',
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
  });
  next();
};

const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
  });
  next(err);
};

module.exports = { logger, requestLogger, errorLogger }; 