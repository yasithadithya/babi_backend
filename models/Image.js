const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Filename is required']
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: null
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    cloudinaryId: {
        type: String,
        default: null
    },
    category: {
        type: String,
        enum: ['babiii', 'moments', 'letter'],
        required: [true, 'Category is required']
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
imageSchema.index({ category: 1, date: -1 });
imageSchema.index({ category: 1, order: 1 });

// Virtual for formatted date
imageSchema.virtual('formattedDate').get(function () {
    if (!this.date) return null;
    return this.date.toISOString().split('T')[0];
});

// Include virtuals in JSON
imageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Image', imageSchema);
