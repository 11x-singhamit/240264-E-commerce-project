const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

// ✅ JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access token required' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ 
                success: false,
                message: 'Invalid or expired token' 
            });
        }
        
        req.user = decoded; // Contains: id, email, username, role
        next();
    });
};

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        console.log('Registration attempt for:', email, 'username:', username);

        // Validation
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists (by email or username)
        const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
        const [existingUsers] = await db.execute(checkUserQuery, [email, username]);

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            } else if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user (matching your database structure)
        const insertQuery = `
            INSERT INTO users (username, email, password, first_name, last_name, role, created_at) 
            VALUES (?, ?, ?, ?, ?, 'user', NOW())
        `;
        
        const [result] = await db.execute(insertQuery, [
            username,
            email,
            hashedPassword,
            firstName,
            lastName
        ]);

        console.log('User created with ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to LuxeShop!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email - Include all fields needed for frontend
        const query = 'SELECT * FROM users WHERE email = ?';
        const [users] = await db.execute(query, [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Format user data for frontend (matching your frontend expectations)
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone || '',
            address: user.address || '',
            role: user.role,
            created_at: user.created_at
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// ✅ NEW - GET Profile route
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('Profile request for user ID:', req.user.id);
        
        // Get user from database including phone and address
        const query = 'SELECT id, username, email, first_name, last_name, role, phone, address, created_at FROM users WHERE id = ?';
        const [users] = await db.execute(query, [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                phone: user.phone || '',
                address: user.address || '',
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});

// ✅ NEW - UPDATE Profile route
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone, address } = req.body;

        console.log('Profile update request for user ID:', userId, req.body);

        // Validation - firstName and lastName are required
        if (!firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'First name and last name are required'
            });
        }

        // Phone validation (optional but if provided, should be valid)
        if (phone && phone.trim() !== '') {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(phone.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid phone number'
                });
            }
        }

        // Update user profile (only the fields that can be updated)
        const updateQuery = `
            UPDATE users 
            SET first_name = ?, last_name = ?, phone = ?, address = ?
            WHERE id = ?
        `;
        
        await db.execute(updateQuery, [
            firstName.trim(),
            lastName.trim(),
            phone ? phone.trim() : null,
            address ? address.trim() : null,
            userId
        ]);

        // Fetch updated user data
        const selectQuery = 'SELECT id, username, email, first_name, last_name, role, phone, address, created_at FROM users WHERE id = ?';
        const [updatedUsers] = await db.execute(selectQuery, [userId]);
        const updatedUser = updatedUsers[0];

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                role: updatedUser.role,
                phone: updatedUser.phone || '',
                address: updatedUser.address || '',
                created_at: updatedUser.created_at
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

// ✅ NEW - Change Password route
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        console.log('Password change request for user ID:', userId);

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get current user password
        const query = 'SELECT password FROM users WHERE id = ?';
        const [users] = await db.execute(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
        await db.execute(updateQuery, [hashedNewPassword, userId]);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
});

module.exports = router;
