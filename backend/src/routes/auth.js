const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/google', async (req, res) => {
    try {
        const { email, name, image, googleId } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        let user = await User.findOne({ email });
        let isNewUser = false;
        let coinsAwarded = 0;

        if (!user) {
            // New User Signup
            isNewUser = true;
            coinsAwarded = 10;
            user = new User({
                email,
                name,
                image,
                googleId,
                gridCoins: 10, // 10 coins on signup
                lastVisit: new Date(),
                lastLoginDate: new Date(),
                loginStreak: 1
            });
            console.log(`✨ New User Signup: ${email} (+10 coins)`);
        } else {
            // Existing User - Daily Visit Check
            const now = new Date();
            const lastVisit = user.lastVisit ? new Date(user.lastVisit) : new Date(0);
            
            // Check if it's a different day (simple check: date string comparison or 24h)
            // User asked for "daily visit". Let's use calendar day check for simplicity and fairness
            const isDifferentDay = now.toDateString() !== lastVisit.toDateString();

            if (isDifferentDay) {
                user.gridCoins = (user.gridCoins || 0) + 1; // 1 coin for daily visit
                user.lastVisit = now;
                user.lastLoginDate = now; // Sync login date
                user.loginStreak = (user.loginStreak || 0) + 1;
                coinsAwarded = 1;
                console.log(`📅 Daily Visit: ${email} (+1 coin)`);
            } else {
                user.lastVisit = now; // Just update timestamp
                user.lastLoginDate = now;
            }

            // Update profile info if changed
            if (name) user.name = name;
            if (image) user.image = image;
            if (googleId && !user.googleId) user.googleId = googleId;
        }

        await user.save();

        // Track Analytics
        const { trackUserActivity } = require('../services/analytics');
        await trackUserActivity(user._id).catch(e => console.error('Analytics error:', e));

        res.json({ success: true, user, isNewUser, coinsAwarded });
    } catch (error) {
        console.error('Auth Route Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
