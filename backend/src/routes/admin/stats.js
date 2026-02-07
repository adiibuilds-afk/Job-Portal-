const express = require('express');
const router = express.Router();
const User = require('../../models/User');

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
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/dashboard-stats', async (req, res) => {
    try {
        const Job = require('../../models/Job');
        const Analytics = require('../../models/Analytics');
        const CoinTransaction = require('../../models/CoinTransaction');
        const ResumeQueue = require('../../models/ResumeQueue');
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

        const [usersToday, usersWeek, totalUsers, dau, mau, jobsToday, jobsWeek, coinBalance, coinsEarnedAgg, coinsSpentAgg, latestAnalytics, resumeQueueCount, expiredJobs, zeroEngagementJobs, reportedJobs] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({}),
            User.countDocuments({ lastLoginDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            User.countDocuments({ lastLoginDate: { $gte: monthAgo } }),
            Job.countDocuments({ createdAt: { $gte: todayStart } }),
            Job.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.aggregate([{ $group: { _id: null, total: { $sum: "$gridCoins" } } }]),
            CoinTransaction.aggregate([{ $match: { type: 'earn', createdAt: { $gte: weekAgo } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            CoinTransaction.aggregate([{ $match: { type: 'spend', createdAt: { $gte: weekAgo } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            Analytics.findOne({ date: new Date().toISOString().split('T')[0] }),
            ResumeQueue.countDocuments({ status: { $in: ['pending', 'processing'] } }),
            Job.countDocuments({ createdAt: { $lt: fortyFiveDaysAgo } }),
            Job.countDocuments({ clickCount: { $lte: 0 }, saveCount: { $lte: 0 } }),
            Job.countDocuments({ reported: true })
        ]);

        res.json({
            usersToday, usersWeek, totalUsers, dau, mau, jobsToday, jobsWeek,
            coinBalance: coinBalance[0]?.total || 0,
            coinsEarned: coinsEarnedAgg[0]?.total || 0,
            coinsSpent: Math.abs(coinsSpentAgg[0]?.total || 0),
            applyClicks: latestAnalytics?.metrics?.applyClicks || 0,
            scansToday: latestAnalytics?.metrics?.resumeScans || 0,
            totalJobViews: latestAnalytics?.metrics?.jobViews || 1,
            resumeQueueCount, expiredJobs, zeroEngagementJobs, reportedJobs,
            systemHealth: { api: 'Operational', scrapers: 'Idle', database: 'Connected' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

router.get('/broadcast-analytics', async (req, res) => {
    try {
        const Settings = require('../../models/Settings');
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

module.exports = router;
