const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Activity Heatmap Route
// Track Activity Event
router.post('/track', async (req, res) => {
    try {
        const { email, action, jobId, metadata } = req.body;
        if (!email || !action) return res.status(400).json({ error: 'Email and action required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.activityLogs.push({
            action,
            jobId,
            metadata,
            timestamp: new Date()
        });

        await user.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Activity Heatmap Route
router.get('/activity-heatmap', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const activityMap = {};
        // Initialize last 365 days with 0
        for (let d = new Date(oneYearAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            activityMap[dateKey] = 0;
        }

        // 1. Count actual applications (Highest weight)
        user.appliedJobs.forEach(app => {
            if (app.appliedAt) {
                const dateKey = new Date(app.appliedAt).toISOString().split('T')[0];
                if (activityMap[dateKey] !== undefined) activityMap[dateKey] += 5; // Application = 5 points
            }
        });

        // 2. Count activity logs (Lower weight)
        if (user.activityLogs) {
            user.activityLogs.forEach(log => {
                const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
                if (activityMap[dateKey] !== undefined) {
                    // Cap daily contribution from simple clicks to avoid spam
                    // User requested 1:1 mapping for clicks
                    activityMap[dateKey] += 1; 
                } else {
                    // If dateKey is not in last 365 days (e.g. today, if loop stopped at yesterday), add it?
                    // The loop goes up to new Date(), so today should be included.
                    // However, we need to ensure strings match exactly.
                    // activityMap is initialized with ISO string split at T.
                    // log.timestamp is Date object.
                }
            });
        }

        const heatmapData = Object.entries(activityMap).map(([date, count]) => ({ date, count }));
        res.json({ heatmapData });
    } catch (error) {
        console.error('Heatmap Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
