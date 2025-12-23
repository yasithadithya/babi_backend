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

// Middleware to ensure DB connection before processing requests
const ensureDbConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

// Import routes
const authRoutes = require('../../routes/auth');
const imageRoutes = require('../../routes/images');

// Health check endpoint (no DB needed)
app.get('/.netlify/functions/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Babi Web API is running on Netlify! 💕' });
});

// Mount routes directly on the Netlify functions path
app.use('/.netlify/functions/api/auth', ensureDbConnection, authRoutes);
app.use('/.netlify/functions/api/images', ensureDbConnection, imageRoutes);

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
        message: 'Route not found',
        path: req.path,
        originalUrl: req.originalUrl
    });
});

// Export the serverless handler with basePath configuration
module.exports.handler = serverless(app);
