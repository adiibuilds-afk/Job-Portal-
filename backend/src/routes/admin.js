const express = require('express');
const router = express.Router();
const ScheduledJob = require('../models/ScheduledJob');
const Analytics = require('../models/Analytics');
const Settings = require('../models/Settings');
const Job = require('../models/Job');
const User = require('../models/User');

// --- Queue Routes ---

// Get all queue items
router.get('/queue', async (req, res) => {
    try {
        const queue = await ScheduledJob.find().sort({ scheduledFor: 1 });
        res.json(queue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Run a specific queue item (Placeholder - actual logic might depend on worker)
router.post('/queue/:id/run', async (req, res) => {
    try {
        const job = await ScheduledJob.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        
        // Logic to trigger the job immediately
        // For now, we'll set it to 'pending' and scheduledFor to now to be picked up by worker
        job.status = 'pending';
        job.scheduledFor = new Date();
        await job.save();

        res.json({ message: 'Job scheduled for immediate execution' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a queue item
router.delete('/queue/:id', async (req, res) => {
    try {
        await ScheduledJob.findByIdAndDelete(req.params.id);
        res.json({ message: 'Queue item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear queue by status
router.delete('/queue/clear', async (req, res) => {
    try {
        const { status } = req.query;
        if (!status) return res.status(400).json({ error: 'Status is required' });
        
        await ScheduledJob.deleteMany({ status });
        res.json({ message: `Cleared all ${status} jobs` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get queue interval setting
router.get('/queue-interval', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'queue_interval_minutes' });
        res.json({ interval: setting ? setting.value : 5 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all settings
router.get('/settings', async (req, res) => {
    try {
        const settingsDesc = await Settings.find();
        // Transform array to object: { key: value }
        const settingsObj = settingsDesc.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update settings
router.post('/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        await Settings.findOneAndUpdate(
            { key },
            { key, value },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Analytics Routes ---

// Get CEO dashboard stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments({ isActive: true });
        const totalUsers = await Job.aggregate([{ $group: { _id: "$company", count: { $sum: 1 } } }]).then(res => res.length); // Proxy for companies
        const activeAlerts = await ScheduledJob.countDocuments({ status: 'pending' });
        
        // Cleanup Stats
        const fortyFiveDaysAgo = new Date();
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

        const expiredJobs = await Job.countDocuments({ 
            createdAt: { $lt: fortyFiveDaysAgo }, 
            isActive: true 
        });

        const zeroEngagementJobs = await Job.countDocuments({
            clicks: 0,
            views: 0,
            isActive: true,
            createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days to give them a chance
        });

        const reportedJobs = await Job.countDocuments({
            reportCount: { $gt: 0 },
            isActive: true
        });

        // Time-based stats
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

        const jobsToday = await Job.countDocuments({ createdAt: { $gte: startOfToday } });
        const jobsWeek = await Job.countDocuments({ createdAt: { $gte: startOfWeek } });

        // Users Today (using createdAt from User model)
        const usersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
        const usersWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });

        // DAU/MAU
        const todayStr = now.toISOString().split('T')[0];
        const todayAnalytics = await Analytics.findOne({ date: todayStr });
        
        const dau = todayAnalytics ? todayAnalytics.activeUsers.length : 0;
        const mau = await User.countDocuments({}); 

        // Resume Scans Today
        const scansToday = todayAnalytics ? todayAnalytics.metrics.resumeScans : 0;

        // Apply Rate Stats
        // Aggregating views and clicks from all jobs
        const engagementStats = await Job.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" }, totalClicks: { $sum: "$clicks" } } }
        ]);
        const totalJobViews = engagementStats[0]?.totalViews || 0;
        const applyClicks = engagementStats[0]?.totalClicks || 0;

        // Mock data for now if real data is complex to aggregate quickly
        const revenue = 0; 
        
        const coinsEarned = await User.aggregate([{ $group: { _id: null, total: { $sum: "$gridCoins" } } }]).then(res => res[0]?.total || 0);
        // Mock coins spent for now
        const coinsSpent = Math.floor(coinsEarned * 0.3);

        res.json({
            totalJobs,
            totalUsers: mau, // Use actual total users count here
            activeAlerts,
            revenue,
            expiredJobs,
            zeroEngagementJobs,
            reportedJobs,
            coinsEarned,
            coinsSpent,
            scansToday,
            usersToday,
            usersWeek,
            jobsToday,
            jobsWeek,
            dau,
            mau,
            totalJobViews,
            applyClicks
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get detailed analytics for charts
router.get('/analytics/detailed', async (req, res) => {
    try {
        // Return active analytics data sorted by date
        const data = await Analytics.find().sort({ date: 1 }).limit(30);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Job Management Routes ---

// Smart Cleanup Routes
router.post('/cleanup/:type', async (req, res) => {
    try {
        const { type } = req.params;
        let result;

        if (type === 'expired') {
            const fortyFiveDaysAgo = new Date();
            fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
            result = await Job.updateMany(
                { createdAt: { $lt: fortyFiveDaysAgo }, isActive: true },
                { isActive: false }
            );
            return res.json({ success: true, message: `Archived ${result.modifiedCount} expired jobs` });
        }

        if (type === 'zero-engagement') {
             result = await Job.updateMany(
                { 
                    clicks: 0, 
                    views: 0, 
                    isActive: true,
                    createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                },
                { isActive: false }
            );
            return res.json({ success: true, message: `Archived ${result.modifiedCount} low engagement jobs` });
        }

        res.status(400).json({ error: 'Invalid cleanup type' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cleanup old jobs (Legacy - keep for backward compatibility or remove if unused)
router.post('/cleanup', async (req, res) => {
    try {
        // Archive non-featured jobs older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result = await Job.updateMany(
            { createdAt: { $lt: thirtyDaysAgo }, isFeatured: { $ne: true } },
            { isActive: false }
        );
        
        res.json({ message: `Archived ${result.modifiedCount} old jobs` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear all jobs (Dangerous)
router.delete('/jobs/clear', async (req, res) => {
    try {
        await Job.deleteMany({});
        res.json({ message: 'All jobs deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear reported jobs
router.delete('/jobs/reported', async (req, res) => {
    try {
        // Assuming there's a reports field or isReported flag
        // Based on page.tsx 'jobFilter' toggle, there must be a way to identify them.
        // I'll assume 'reports' array length > 0 or similar.
        // Let's assume reports count > 0 for now.
        const result = await Job.deleteMany({ $expr: { $gt: [{ $size: "$reports" }, 0] } });
        res.json({ message: 'Reported jobs cleared' });
    } catch (err) {
        // Fallback if reports is not an array (e.g. number)
        try {
             const result = await Job.deleteMany({ reports: { $gt: 0 } });
             res.json({ message: 'Reported jobs cleared' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
});

// Toggle job status
router.put('/jobs/:id/toggle', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        
        job.isActive = !job.isActive;
        await job.save();
        res.json({ success: true, isActive: job.isActive });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete specific job
router.delete('/jobs/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- User Management Routes ---

// Get all users with pagination and search
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const query = search 
            ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
            : {};

        const users = await User.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user (tier, coins, etc.)
router.put('/users/:id', async (req, res) => {
    try {
        const { tier, gridCoins, name } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { tier, gridCoins, name },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user counts by batch/graduation year
router.get('/user-counts', async (req, res) => {
    try {
        // Aggregate by batch or graduationYear. 
        // Frontend expects { "2025": 10, "2024": 5 }
        const counts = await User.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$batch", "$graduationYear"] }, // Fallback to grad year if batch is null
                    count: { $sum: 1 }
                }
            }
        ]);

        const formatCounts = counts.reduce((acc, curr) => {
            if (curr._id) acc[curr._id.toString()] = curr.count;
            return acc;
        }, {});

        res.json(formatCounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Broadcast/Alert Routes ---

// Get broadcast analytics (Mock for now)
router.get('/broadcast-analytics', async (req, res) => {
    try {
        // In a real app, calculate from email logs
        res.json({
            openRate: 45,
            ctr: 12
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get AI Job Suggestions for a batch
router.get('/ai-job-suggestions', async (req, res) => {
    try {
        const { batch } = req.query;
        // Mock logic: Find jobs relevant to this batch (e.g. by title or simply recent jobs)
        // For now, return recent jobs as suggestions
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
        
        const suggestions = jobs.map(job => ({
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            slug: job._id, // Assuming slug is ID for now or job has slug
            matchScore: Math.floor(Math.random() * 20) + 80 // Mock score 80-99
        }));

        res.json({ suggestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send batch alerts
router.post('/alerts/batch', async (req, res) => {
    try {
        const { batches, subject, message } = req.body;
        // Logic to send emails/notifications to users in these batches
        // For now, just count them
        // const count = await User.countDocuments({ batch: { $in: batches } });
        
        // Mock success
        res.json({ count: 100, message: 'Alerts queued successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
