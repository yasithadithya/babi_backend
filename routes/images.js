const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Check if running in Netlify serverless environment
const isNetlify = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Only create uploads directory if NOT in serverless environment
let uploadsDir;
if (!isNetlify) {
    uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
}

// Multer configuration - use memory storage for serverless, disk for local
let storage;
if (isNetlify) {
    // In serverless, use memory storage (file uploads won't persist anyway)
    storage = multer.memoryStorage();
} else {
    // Local development - use disk storage
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const category = req.body.category || 'general';
            const categoryDir = path.join(uploadsDir, category);

            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            cb(null, categoryDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });
}

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   GET /api/images/babiii
// @desc    Get all images from Babiii gallery
// @access  Public (with optional auth)
router.get('/babiii', optionalAuth, async (req, res) => {
    try {
        const images = await Image.find({ category: 'babiii' })
            .sort({ date: 1, order: 1 })
            .lean();

        res.json({
            success: true,
            count: images.length,
            data: images
        });
    } catch (error) {
        console.error('Error fetching babiii images:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching images'
        });
    }
});

// @route   GET /api/images/moments
// @desc    Get all images from Moments gallery
// @access  Public (with optional auth)
router.get('/moments', optionalAuth, async (req, res) => {
    try {
        const images = await Image.find({ category: 'moments' })
            .sort({ date: 1, order: 1 })
            .lean();

        res.json({
            success: true,
            count: images.length,
            data: images
        });
    } catch (error) {
        console.error('Error fetching moments images:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching images'
        });
    }
});

// @route   GET /api/images/letter
// @desc    Get the love letter image
// @access  Public (with optional auth)
router.get('/letter', optionalAuth, async (req, res) => {
    try {
        const letter = await Image.findOne({ category: 'letter' }).lean();

        res.json({
            success: true,
            data: letter
        });
    } catch (error) {
        console.error('Error fetching letter:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching letter'
        });
    }
});

// @route   GET /api/images/:id
// @desc    Get single image by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id).lean();

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.json({
            success: true,
            data: image
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching image'
        });
    }
});

// @route   POST /api/images
// @desc    Upload a new image
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { filename, description, date, category } = req.body;

        if (!category || !['babiii', 'moments', 'letter'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Valid category is required (babiii, moments, or letter)'
            });
        }

        const imageUrl = `/uploads/${category}/${req.file.filename}`;

        const image = new Image({
            filename: filename || req.file.originalname,
            description: description || '',
            date: date ? new Date(date) : null,
            imageUrl,
            category
        });

        await image.save();

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully! 💕',
            data: image
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image'
        });
    }
});

// @route   POST /api/images/bulk
// @desc    Add multiple images (for initial seeding)
// @access  Private
router.post('/bulk', auth, async (req, res) => {
    try {
        const { images } = req.body;

        if (!images || !Array.isArray(images)) {
            return res.status(400).json({
                success: false,
                message: 'Images array is required'
            });
        }

        const insertedImages = await Image.insertMany(images);

        res.status(201).json({
            success: true,
            message: `${insertedImages.length} images added successfully!`,
            count: insertedImages.length
        });
    } catch (error) {
        console.error('Error bulk inserting images:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding images'
        });
    }
});

// @route   PUT /api/images/:id
// @desc    Update an image
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { filename, description, date, order } = req.body;

        const image = await Image.findByIdAndUpdate(
            req.params.id,
            { filename, description, date, order },
            { new: true, runValidators: true }
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.json({
            success: true,
            message: 'Image updated successfully!',
            data: image
        });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating image'
        });
    }
});

// @route   DELETE /api/images/:id
// @desc    Delete an image
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const image = await Image.findByIdAndDelete(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Optionally delete the file from uploads folder
        const filePath = path.join(__dirname, '..', image.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({
            success: true,
            message: 'Image deleted successfully!'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image'
        });
    }
});

module.exports = router;
