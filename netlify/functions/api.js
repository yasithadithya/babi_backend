const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../../config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration - Allow all origins for Netlify deployment
app.use(cors({
    origin: true, // Allow all origins, or specify your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router for Netlify Functions
const router = express.Router();

// Import routes
const authRoutes = require('../../routes/auth');
const imageRoutes = require('../../routes/images');

// API Routes
router.use('/auth', authRoutes);
router.use('/images', imageRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Babi Web API is running on Netlify! 💕' });
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
