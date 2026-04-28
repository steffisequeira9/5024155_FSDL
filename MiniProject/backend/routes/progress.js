const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   POST api/progress/update
// @desc    Sync CO2 savings, streak, and badges
// @access  Private
router.post('/update', auth, async (req, res) => {
    try {
        const { totalCO2Saved, streak, badges } = req.body;
        
        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.totalCO2Saved = totalCO2Saved !== undefined ? totalCO2Saved : user.totalCO2Saved;
        user.streak = streak !== undefined ? streak : user.streak;
        user.badges = badges !== undefined ? badges : user.badges;

        await user.save();
        res.json({ msg: 'Progress updated', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/progress/leaderboard
// @desc    Get top users by totalCO2Saved
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find()
            .select('name totalCO2Saved streak badges')
            .sort({ totalCO2Saved: -1 })
            .limit(20);
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
