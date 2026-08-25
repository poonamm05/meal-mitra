import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mealmitra_secret_jwt_key_super_secure_2026');
      
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      } else {
        // Fallback demo user if in memory
        req.user = {
          _id: decoded.id || 'demo_user_id',
          name: 'Demo User',
          email: 'demo@mealmitra.com',
          householdSize: 2,
          dietaryPreference: 'vegetarian',
        };
      }
      return next();
    } catch (error) {
      console.error('JWT auth error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mealmitra_secret_jwt_key_super_secure_2026');
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    } catch (e) {
      // ignore
    }
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};
