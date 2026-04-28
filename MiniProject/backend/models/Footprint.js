const mongoose = require('mongoose');

const FootprintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD format for easy daily queries
        required: true
    },
    kilometersWalked: {
        type: Number,
        default: 0
    },
    kilometersPublicTransport: {
        type: Number,
        default: 0
    },
    walkingCO2Saved: {
        type: Number,
        default: 0
    },
    transportCO2Saved: {
        type: Number,
        default: 0
    },
    totalCO2Saved: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound index to ensure 1 entry per user per day
FootprintSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Footprint', FootprintSchema);
