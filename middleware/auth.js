const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user with JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request object
    req.user = {
      id: user._id,
      role: user.role,
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is a contributor
exports.isContributor = (req, res, next) => {
  if (req.user.role !== 'contributor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Contributor role required.' });
  }
  next();
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};
