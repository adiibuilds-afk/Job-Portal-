const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendNotification } = require('../services/notificationService');

// Broadcast notification to all app users
router.post('/broadcast', async (req, res) => {
    try {
        const { title, body, url } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        // Get all unique FCM tokens from all users
        const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
        let allTokens = [];
        users.forEach(user => {
            allTokens = [...allTokens, ...user.fcmTokens];
        });

        const uniqueTokens = [...new Set(allTokens)];

        if (uniqueTokens.length === 0) {
            return res.status(404).json({ error: 'No registered devices found' });
        }

        await sendNotification(uniqueTokens, title, body, { url: url || 'https://jobgrid.in/jobs' });

        res.json({ success: true, deviceCount: uniqueTokens.length });
    } catch (error) {
        console.error('Broadcast Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
