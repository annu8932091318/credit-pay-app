const jwt = require('jsonwebtoken');
const Shopkeeper = require('../models/shopkeepers');

// Middleware to authenticate shopkeeper using JWT
module.exports = function(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the full shopkeeper object to req.user for downstream use
    Shopkeeper.findById(decoded.shopkeeperId)
      .then(shopkeeper => {
        if (!shopkeeper) {
          return res.status(401).json({ error: 'Shopkeeper not found' });
        }
        req.user = shopkeeper;
        next();
      })
      .catch(err => {
        return res.status(500).json({ error: 'Error fetching shopkeeper' });
      });
  } catch (err) {
    return res.status(401).json({ error: 'Token is not valid' });
  }
};
