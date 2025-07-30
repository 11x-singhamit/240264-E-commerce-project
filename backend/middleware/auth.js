const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔍 Auth middleware debug:', {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'null',
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
        route: req.path,
        method: req.method
    });

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ 
            success: false,
            message: 'Access token required' 
        });
    }

    try {
        console.log('🔓 Attempting to verify token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decoded successfully:', { id: decoded.id, username: decoded.username });
        
        // Get user from database to ensure they still exist
        console.log('🔍 Looking up user in database...');
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            console.log('❌ User not found in database for ID:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token - user not found' 
            });
        }

        console.log('✅ User found:', { id: users[0].id, username: users[0].username });
        req.user = users[0];
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', {
            name: error.name,
            message: error.message
        });
        return res.status(403).json({ 
            success: false,
            message: 'Invalid token: ' + error.message 
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

module.exports = { authenticateToken, requireAdmin };
