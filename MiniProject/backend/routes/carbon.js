const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Footprint = require('../models/Footprint');
const User = require('../models/User');

// Helper to format date as YYYY-MM-DD
const getTodayDateString = () => {
    const today = new Date();
    // Use local timezone to prevent shift issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// @route   POST api/footprint/add
// @desc    Add a daily carbon footprint calculation
// @access  Private
router.post('/add', auth, async (req, res) => {
    try {
        const { kilometersWalked, kilometersPublicTransport } = req.body;
        const date = getTodayDateString();

        // 1. Check if an entry for today already exists
        let existingEntry = await Footprint.findOne({ userId: req.user.id, date });
        if (existingEntry) {
            return res.status(400).json({ msg: "Today's entry already saved. Come back tomorrow." });
        }

        // 2. Calculation logic
        const walkKm = Number(kilometersWalked) || 0;
        const transitKm = Number(kilometersPublicTransport) || 0;
        const walkingCO2Saved = walkKm * 0.21;
        const transportCO2Saved = transitKm * 0.05;
        const totalCO2Saved = walkingCO2Saved + transportCO2Saved;

        // 3. Save new footprint
        const newFootprint = new Footprint({
            userId: req.user.id,
            date,
            kilometersWalked: walkKm,
            kilometersPublicTransport: transitKm,
            walkingCO2Saved,
            transportCO2Saved,
            totalCO2Saved
        });
        await newFootprint.save();

        // 4. Lifetime CO2 Aggregation
        const allFootprints = await Footprint.find({ userId: req.user.id });
        const lifetimeCO2Saved = allFootprints.reduce((sum, entry) => sum + entry.totalCO2Saved, 0);

        // 5. Update user model
        const user = await User.findById(req.user.id);
        if (user) {
            user.totalCO2Saved = lifetimeCO2Saved;
            await user.save();
        }

        res.json({
            msg: "Entry saved successfully",
            footprint: newFootprint,
            lifetimeCO2Saved
        });

    } catch (err) {
        console.error("Footprint Add Error:", err.message);
        // Catch duplicate key error from compound index
        if (err.code === 11000) {
            return res.status(400).json({ msg: "Today's entry already saved. Come back tomorrow." });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/footprint/history
// @desc    Get user's past footprint entries
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const footprints = await Footprint.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(footprints);
    } catch (err) {
        console.error("Footprint History Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/footprint/total
// @desc    Get user's lifetime total CO2
// @access  Private
router.get('/total', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('totalCO2Saved streak');
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json({
            totalCO2Saved: user.totalCO2Saved,
            streak: user.streak
        });
    } catch (err) {
        console.error("Footprint Total Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
