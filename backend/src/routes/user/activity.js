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
            activityMap[dateKey] = new Set(); // Use Set to track unique jobIds per day
        }

        // Count unique jobs applied per day
        user.appliedJobs.forEach(app => {
            if (app.appliedAt && app.jobId) {
                const dateKey = new Date(app.appliedAt).toISOString().split('T')[0];
                if (activityMap[dateKey] !== undefined) {
                    activityMap[dateKey].add(app.jobId.toString()); // Add to Set (auto-deduplicates)
                }
            }
        });

        // Convert Sets to counts
        const heatmapData = Object.entries(activityMap).map(([date, jobSet]) => ({ 
            date, 
            count: jobSet.size // Unique job count
        }));
        res.json({ heatmapData });
    } catch (error) {
        console.error('Heatmap Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
