const express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login with secret password
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Check against secret password (case-insensitive)
        const secretPassword = process.env.SECRET_PASSWORD || 'communication';

        if (password.toLowerCase() !== secretPassword.toLowerCase()) {
            return res.status(401).json({
                success: false,
                message: 'Wrong secret word, try again babyyy 🥺💔'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                authenticated: true,
                loginTime: new Date().toISOString()
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Welcome to Babi World! 💖',
            token,
            expiresIn: '7 days'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/verify
// @desc    Verify if token is valid
// @access  Public
router.post('/verify', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            valid: true,
            message: 'Token is valid',
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });

    } catch (error) {
        res.json({
            success: false,
            valid: false,
            message: 'Token is invalid or expired'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user info
// @access  Private
router.get('/me', auth, (req, res) => {
    res.json({
        success: true,
        authenticated: true,
        loginTime: req.user.loginTime,
        message: 'You are authenticated! 💕'
    });
});

module.exports = router;
