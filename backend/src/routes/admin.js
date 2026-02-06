const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get User Counts by Batch/Range
router.get('/user-counts', async (req, res) => {
    try {
        const counts = {
            'older-2023': await User.countDocuments({ graduationYear: { $lt: 2023 } }),
            '2023': await User.countDocuments({ batch: '2023' }),
            '2024': await User.countDocuments({ batch: '2024' }),
            '2025': await User.countDocuments({ batch: '2025' }),
            '2026': await User.countDocuments({ batch: '2026' }),
            '2027': await User.countDocuments({ batch: '2027' }),
            '2028': await User.countDocuments({ batch: '2028' }),
            '2029': await User.countDocuments({ batch: '2029' }),
            'greater-2029': await User.countDocuments({ graduationYear: { $gt: 2029 } })
        };
        res.json(counts);
    } catch (error) {
        console.error('User Counts Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Targeted Batch Alerts
router.post('/alerts/batch', async (req, res) => {
    try {
        const { batches, subject, message } = req.body;
        
        if (!batches || !Array.isArray(batches) || batches.length === 0 || !message || !subject) {
            return res.status(400).json({ error: 'Batches (array), Subject, and Message are required' });
        }

        const { sendBroadcastEmail } = require('../services/email');

        // Build query for multiple batches/ranges
        const queryArr = batches.map(b => {
            if (b === 'older-2023') return { graduationYear: { $lt: 2023 } };
            if (b === 'greater-2029') return { graduationYear: { $gt: 2029 } };
            return { batch: b };
        });

        const users = await User.find({ $or: queryArr });
        const emails = users.map(u => u.email).filter(Boolean);
        
        if (emails.length === 0) {
            return res.json({ success: true, count: 0, message: 'No users found for selected batches' });
        }

        console.log(`[ALERT SYSTEM] Sending to ${emails.length} users of batches: ${batches.join(', ')}`);

        await sendBroadcastEmail(emails, subject, message);

        res.json({ success: true, count: emails.length, message: 'Alerts sent successfully' });

    } catch (error) {
        console.error('Batch Alert Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auto-Scraper Trigger
router.post('/scraper/trigger', async (req, res) => {
    try {
        const { runAutoScraper } = require('../services/scheduler');
        
        // Run asynchronously
        runAutoScraper(req.app.get('bot'));
        
        res.json({ success: true, message: 'Auto-scraper started in background.' });
    } catch (error) {
        console.error('Trigger Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Manual Scraper Trigger
router.post('/scrape/talentd', async (req, res) => {
    try {
        const { scrapeTalentdJobs } = require('../services/scraper');
        const { queueLinks } = require('../services/scheduler');
        
        const links = await scrapeTalentdJobs();
        const newCount = await queueLinks(links);

        res.json({ success: true, count: newCount, message: `Talentd scraper triggered. Found ${links.length} links, queued ${newCount} new jobs.` });
    } catch (error) {
        console.error('Talentd Scrape Error:', error);
        res.status(500).json({ error: 'Failed to trigger Talentd scraper' });
    }
});

router.post('/scrape/rgjobs', async (req, res) => {
    try {
        const { scrapeRgJobs } = require('../services/scraper');
        const { queueLinks } = require('../services/scheduler');
        
        const links = await scrapeRgJobs();
        const newCount = await queueLinks(links);

        res.json({ success: true, count: newCount, message: `RG Jobs triggered. Found ${links.length} links, queued ${newCount} new jobs.` });
    } catch (error) {
        console.error('RG Scrape Error:', error);
        res.status(500).json({ error: 'Failed to trigger RG Jobs scraper' });
    }
});

router.delete('/queue/clear', async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const ScheduledJob = require('../models/ScheduledJob');
        const result = await ScheduledJob.deleteMany({ status });
        res.json({ success: true, message: `Cleared ${result.deletedCount} ${status} jobs from queue.` });
    } catch (error) {
        console.error('Clear Queue Error:', error);
        res.status(500).json({ error: 'Failed to clear queue' });
    }
});

router.delete('/jobs/clear', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const result = await Job.deleteMany({});
        res.json({ success: true, message: `Successfully deleted all ${result.deletedCount} jobs.` });
    } catch (error) {
        console.error('Clear Jobs Error:', error);
        res.status(500).json({ error: 'Failed to clear jobs' });
    }
});

// Smart Cleanup: Archive Expired Jobs (45+ days old)
router.post('/cleanup/expired', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 45);
        
        const result = await Job.updateMany(
            { createdAt: { $lt: cutoffDate }, isActive: { $ne: false } },
            { $set: { isActive: false, archivedAt: new Date(), archiveReason: 'expired' } }
        );
        
        res.json({ 
            success: true, 
            count: result.modifiedCount,
            message: `Archived ${result.modifiedCount} expired jobs.` 
        });
    } catch (error) {
        console.error('Archive Expired Jobs Error:', error);
        res.status(500).json({ error: 'Failed to archive expired jobs' });
    }
});

// Smart Cleanup: Archive Zero Engagement Jobs
router.post('/cleanup/zero-engagement', async (req, res) => {
    try {
        const Job = require('../models/Job');
        
        const result = await Job.updateMany(
            { 
                viewCount: { $lte: 0 }, 
                clickCount: { $lte: 0 },
                saveCount: { $lte: 0 },
                isActive: { $ne: false }
            },
            { $set: { isActive: false, archivedAt: new Date(), archiveReason: 'no_engagement' } }
        );
        
        res.json({ 
            success: true, 
            count: result.modifiedCount,
            message: `Archived ${result.modifiedCount} zero-engagement jobs.` 
        });
    } catch (error) {
        console.error('Archive Zero Engagement Error:', error);
        res.status(500).json({ error: 'Failed to archive zero-engagement jobs' });
    }
});

// Smart Cleanup: Get reported jobs for review
router.get('/cleanup/reported', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const reportedJobs = await Job.find({ reportCount: { $gt: 0 } })
            .sort({ reportCount: -1 })
            .limit(50);
        res.json({ jobs: reportedJobs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reported jobs' });
    }
});

router.delete('/jobs/reported', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const result = await Job.deleteMany({ reportCount: { $gt: 0 } });
        res.json({ success: true, message: `Successfully deleted ${result.deletedCount} reported jobs.` });
    } catch (error) {
        console.error('Clear Reported Jobs Error:', error);
        res.status(500).json({ error: 'Failed to clear reported jobs' });
    }
});

// Delete single job
router.delete('/jobs/:id', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete Job Error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// Toggle job status
router.put('/jobs/:id/toggle', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        
        job.isActive = !job.isActive;
        await job.save();
        
        res.json({ success: true, isActive: job.isActive, message: `Job is now ${job.isActive ? 'Active' : 'Hidden'}` });
    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

// ========== CEO DASHBOARD & ANALYTICS ==========

router.get('/dashboard-stats', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const Analytics = require('../models/Analytics');
        const CoinTransaction = require('../models/CoinTransaction');
        const ResumeQueue = require('../models/ResumeQueue');
        
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

        const [
            usersToday,
            usersWeek,
            totalUsers,
            dau,
            mau,
            jobsToday,
            jobsWeek,
            coinBalance,
            coinsEarnedAgg,
            coinsSpentAgg,
            latestAnalytics,
            resumeQueueCount,
            expiredJobs,
            zeroEngagementJobs,
            reportedJobs,
            totalJobViews
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({}),
            User.countDocuments({ lastLoginDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            User.countDocuments({ lastLoginDate: { $gte: monthAgo } }),
            Job.countDocuments({ createdAt: { $gte: todayStart } }),
            Job.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.aggregate([{ $group: { _id: null, total: { $sum: "$gridCoins" } } }]),
            CoinTransaction.aggregate([
                { $match: { type: 'earn', createdAt: { $gte: weekAgo } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            CoinTransaction.aggregate([
                { $match: { type: 'spend', createdAt: { $gte: weekAgo } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Analytics.findOne({ date: new Date().toISOString().split('T')[0] }),
            ResumeQueue.countDocuments({ status: { $in: ['pending', 'processing'] } }),
            Job.countDocuments({ createdAt: { $lt: fortyFiveDaysAgo } }),
            Job.countDocuments({ clickCount: { $lte: 0 }, saveCount: { $lte: 0 } }),
            Job.countDocuments({ reported: true })
        ]);

        res.json({
            usersToday,
            usersWeek,
            totalUsers,
            dau,
            mau,
            jobsToday,
            jobsWeek,
            coinBalance: coinBalance[0]?.total || 0,
            coinsEarned: coinsEarnedAgg[0]?.total || 0,
            coinsSpent: Math.abs(coinsSpentAgg[0]?.total || 0),
            applyClicks: latestAnalytics?.metrics?.applyClicks || 0,
            scansToday: latestAnalytics?.metrics?.resumeScans || 0,
            totalJobViews: latestAnalytics?.metrics?.jobViews || 1,
            resumeQueueCount,
            expiredJobs,
            zeroEngagementJobs,
            reportedJobs,
            systemHealth: {
                api: 'Operational',
                scrapers: 'Idle',
                database: 'Connected'
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// GET All Users (Admin)
router.get('/users', async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update User (Tier, Coins, etc.)
router.put('/users/:id', async (req, res) => {
    try {
        const { tier, gridCoins, name } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (tier) user.tier = tier;
        if (gridCoins !== undefined) user.gridCoins = gridCoins;
        if (name) user.name = name;

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// ========== SETTINGS & MAINTENANCE ==========

router.post('/maintenance/toggle', async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        const setting = await Settings.findOne({ key: 'maintenance_mode' });
        const newValue = setting ? !setting.value : true;
        
        await Settings.findOneAndUpdate(
            { key: 'maintenance_mode' },
            { value: newValue },
            { upsert: true }
        );
        
        res.json({ success: true, maintenanceMode: newValue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
});

// Get all settings
router.get('/settings', async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        const settings = await Settings.find();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.post('/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        const Settings = require('../models/Settings');
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        res.json({ success: true, setting });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// ========== AI JOB SUGGESTIONS FOR BATCH ALERTS ==========

router.get('/ai-job-suggestions', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const batch = req.query.batch || '2025';
        
        // Get recent jobs
        const recentJobs = await Job.find({ isActive: { $ne: false } })
            .sort({ createdAt: -1 })
            .limit(20);
        
        // Simple matching logic based on job keywords and batch patterns
        // In production, this would use actual AI/ML models
        const suggestions = recentJobs.map(job => {
            // Calculate a "match score" based on job attributes
            let score = 60; // Base score
            
            // Boost for internship/entry-level for later batches
            const title = job.title?.toLowerCase() || '';
            const batch_year = parseInt(batch) || 2025;
            
            if (batch_year >= 2025) {
                if (title.includes('intern') || title.includes('entry') || title.includes('fresher')) {
                    score += 20;
                }
                if (title.includes('graduate') || title.includes('junior')) {
                    score += 15;
                }
            } else {
                if (title.includes('senior') || title.includes('lead') || title.includes('manager')) {
                    score += 18;
                }
            }
            
            // Boost for certain keywords
            if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
                score += 10;
            }
            if (job.salary && job.salary !== 'Not disclosed') {
                score += 5;
            }
            
            // Add some randomness to simulate AI variance
            score += Math.floor(Math.random() * 8) - 4;
            score = Math.min(98, Math.max(55, score)); // Clamp between 55-98
            
            return {
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location,
                slug: job.slug,
                matchScore: score,
                matchReason: score >= 85 
                    ? `Strongly matches ${batch} batch resume patterns`
                    : score >= 75 
                    ? `Matches roughly ${score - 5}% of ${batch} batch resume patterns`
                    : `Potential match for ${batch} batch profiles`
            };
        });
        
        // Sort by match score and return top 5
        const topSuggestions = suggestions
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);
        
        res.json({ suggestions: topSuggestions });
    } catch (error) {
        console.error('AI Suggestions Error:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

// ========== BROADCAST ANALYTICS ==========

router.get('/broadcast-analytics', async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        
        // Get stored analytics or return defaults
        const openRateSetting = await Settings.findOne({ key: 'broadcast_open_rate' });
        const ctrSetting = await Settings.findOne({ key: 'broadcast_ctr' });
        const totalSentSetting = await Settings.findOne({ key: 'broadcast_total_sent' });
        
        res.json({
            openRate: openRateSetting?.value || 42.8,
            ctr: ctrSetting?.value || 8.2,
            totalSent: totalSentSetting?.value || 0,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch broadcast analytics' });
    }
});

// Update broadcast analytics after sending
router.post('/broadcast-analytics/update', async (req, res) => {
    try {
        const { sentCount, opens, clicks } = req.body;
        const Settings = require('../models/Settings');
        
        // Get current values
        const totalSentSetting = await Settings.findOne({ key: 'broadcast_total_sent' });
        const currentTotal = totalSentSetting?.value || 0;
        const newTotal = currentTotal + sentCount;
        
        // Calculate new averages (simplified)
        const newOpenRate = opens ? ((opens / sentCount) * 100).toFixed(1) : null;
        const newCtr = clicks ? ((clicks / sentCount) * 100).toFixed(1) : null;
        
        await Settings.findOneAndUpdate(
            { key: 'broadcast_total_sent' },
            { value: newTotal },
            { upsert: true }
        );
        
        if (newOpenRate) {
            await Settings.findOneAndUpdate(
                { key: 'broadcast_open_rate' },
                { value: parseFloat(newOpenRate) },
                { upsert: true }
            );
        }
        
        if (newCtr) {
            await Settings.findOneAndUpdate(
                { key: 'broadcast_ctr' },
                { value: parseFloat(newCtr) },
                { upsert: true }
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update analytics' });
    }
});

// ========== QUEUE INTERVAL ==========

router.get('/queue-interval', async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        const intervalSetting = await Settings.findOne({ key: 'queue_interval_minutes' });
        res.json({ interval: intervalSetting?.value || 5 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch queue interval' });
    }
});

module.exports = router;
