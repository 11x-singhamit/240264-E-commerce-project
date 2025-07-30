const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // ✅ Verify user exists and is admin in database
    const [users] = await db.execute(
      'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ? AND role = ?',
      [decoded.id, 'admin']
    );

    if (users.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = users[0]; // Full user data
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

module.exports = { authenticateAdmin };
