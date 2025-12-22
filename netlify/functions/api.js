const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');

// Set environment variable to indicate Netlify
process.env.NETLIFY = 'true';

const app = express();

// CORS Configuration - Allow all origins for Netlify deployment
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection caching for serverless
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            // SSL/TLS options for Netlify serverless
            tls: true,
            tlsAllowInvalidCertificates: false,
            tlsAllowInvalidHostnames: false,
            retryWrites: true,
            w: 'majority'
        });

        cachedDb = conn;
        console.log('MongoDB connected');
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
};

// Import routes (lazy load to avoid errors during module initialization)
let authRoutes, imageRoutes;

const loadRoutes = () => {
    if (!authRoutes) authRoutes = require('../../routes/auth');
    if (!imageRoutes) imageRoutes = require('../../routes/images');
};

// Router for Netlify Functions
const router = express.Router();

// Health check endpoint (no DB needed)
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Babi Web API is running on Netlify! 💕' });
});

// Middleware to ensure DB connection before processing requests
const ensureDbConnection = async (req, res, next) => {
    try {
        await connectDB();
        loadRoutes();
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

// Apply DB middleware to all routes except health check
router.use('/auth', ensureDbConnection, (req, res, next) => {
    authRoutes(req, res, next);
});

router.use('/images', ensureDbConnection, (req, res, next) => {
    imageRoutes(req, res, next);
});

// Mount router
app.use('/api', router);
app.use('/.netlify/functions/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Export the serverless handler
module.exports.handler = serverless(app);
