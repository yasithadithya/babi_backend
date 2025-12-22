const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        // Check for Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use Bearer token'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

// Optional auth - doesn't fail if no token, just adds user if valid
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Token invalid, but continue without user
        next();
    }
};

module.exports = { auth, optionalAuth };
