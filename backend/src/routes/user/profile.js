const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { attachUser } = require('./middleware');

// Get User Profile (Applied + Saved)
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await User.findOne({ email })
            .populate('savedJobs')
            .populate('appliedJobs.jobId');
        
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Calculate Profile Rank based on activity
        const applicationCount = user.appliedJobs.length;
        let profileRank = 'Top 50%';
        if (applicationCount > 50) profileRank = 'Top 1%';
        else if (applicationCount > 20) profileRank = 'Top 5%';
        else if (applicationCount > 10) profileRank = 'Top 15%';
        else if (applicationCount > 5) profileRank = 'Top 25%';

        res.json({
            user: {
                name: user.name,
                email: user.email,
                image: user.image,
                appliedJobs: user.appliedJobs,
                savedJobs: user.savedJobs,
                batch: user.batch,
                alertPreferences: user.alertPreferences,
                gridCoins: user.gridCoins,
                loginStreak: user.loginStreak,
                badges: user.badges,
                skills: user.skills, // Add skills to response
                profileRank, // Send calculated rank
                activityExcellence: applicationCount * 10 // Arbitrary score for now
            }
        });
    } catch (error) {
        console.error('Profile API Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Profile (e.g. Batch, Preferences)
router.put('/update', attachUser, async (req, res) => {
    try {
        const { name, batch, degree, location, skills, portfolioUrl } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (batch) user.batch = batch;
        if (degree) user.degree = degree;
        if (location) user.location = location;
        if (skills !== undefined) user.skills = skills;
        if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save FCM Token for Push Notifications
router.post('/fcm-token', attachUser, async (req, res) => {
    try {
        const { token } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ error: 'Authentication required' });
        if (!token) return res.status(400).json({ error: 'Token required' });

        // Add token if it doesn't exist
        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            await user.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('FCM Token Save Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
