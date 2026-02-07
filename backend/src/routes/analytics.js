const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Analytics = require('../models/Analytics');

// GET /api/analytics - Aggregate stats
router.get('/', async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments({ isActive: true });
        
        // Sum views and clicks from all jobs (assuming Job model has these fields, derived from common patterns)
        // If Job model doesn't have them, we might need another source, but this is a safe bet for a job portal
        const stats = await Job.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalClicks: { $sum: "$clicks" } // or applications
                }
            }
        ]);

        const totalViews = stats[0]?.totalViews || 0;
        const totalClicks = stats[0]?.totalClicks || 0;

        res.json({
            totalJobs,
            totalViews,
            totalClicks
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
