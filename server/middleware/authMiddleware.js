const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Middleware to verify JWT token
 */
exports.protect = async (req, res, next) => {
  let token;
  

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Check if user has admin role
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.roles.includes('admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};