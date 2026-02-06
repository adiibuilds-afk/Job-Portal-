const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ResumeQueue = require('../models/ResumeQueue');
const Job = require('../models/Job');
const Settings = require('../models/Settings');

// Middleware to mock auth (Copy from user.js for now)
const attachUser = async (req, res, next) => {
    // In production, decode JWT
    const { email } = req.body; 
    if (!email && req.query.email) {
        req.body.email = req.query.email; // Allow query param for GET
    }
    
    const userEmail = req.body.email || req.query.email;

    if (!userEmail) return res.status(401).json({ error: 'Unauthorized: Email required' });
    
    let user = await User.findOne({ email: userEmail });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
};

// Enqueue Resume Analysis
router.post('/analyze', attachUser, async (req, res) => {
    try {
        const { jobId, customJob, resumeText } = req.body;
        const user = req.user;

        if (!resumeText) {
            return res.status(400).json({ error: 'Resume Text is required' });
        }

        // 0. Check Feature Toggle
        const enabledSetting = await Settings.findOne({ key: 'resume_scorer_enabled' });
        // Default to TRUE if not set
        const isEnabled = enabledSetting?.value !== false; 
        
        if (!isEnabled) {
            return res.status(503).json({ error: 'Resume Scorer is currently under maintenance. Try again later.' });
        }

        // 1. Check Daily Limit
        const now = new Date();
        const lastReset = new Date(user.resumeScans?.lastReset || 0);
        const isSameDay = now.getDate() === lastReset.getDate() && 
                          now.getMonth() === lastReset.getMonth() && 
                          now.getFullYear() === lastReset.getFullYear();

        if (isSameDay) {
            if (user.resumeScans.count >= 1) { // LIMIT = 1
                return res.status(429).json({ error: 'Daily limit reached (1 scan/day)' });
            }
        } else {
            // Reset if new day
            user.resumeScans = { count: 0, lastReset: now };
            await user.save();
        }

        // 2. Add to Queue
        const pendingCount = await ResumeQueue.countDocuments({ status: { $in: ['pending', 'processing'] } });
        
        const queueItem = await ResumeQueue.create({
            userId: user._id,
            jobId,
            customJob,
            resumeText,
            status: 'pending'
        });

        const { trackEvent } = require('../services/analytics');
        // 3. Update User Limit
        user.resumeScans.count += 1;
        user.resumeScans.lastReset = now; // Ensure date is current
        await user.save();
        await trackEvent('resumeScans');

        // Estimate wait time (e.g., 30 seconds per job)
        const waitTimeSeconds = (pendingCount + 1) * 30;

        res.json({
            success: true,
            queueId: queueItem._id,
            position: pendingCount + 1,
            waitTime: `${Math.ceil(waitTimeSeconds / 60)} mins`, // Human readable
            status: 'pending'
        });

    } catch (error) {
        console.error('Enqueue Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check Status
router.get('/status/:id', async (req, res) => {
    try {
        const item = await ResumeQueue.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Analysis not found' });

        if (item.status === 'completed') {
            return res.json({
                status: 'completed',
                result: item.result
            });
        }
        
        if (item.status === 'failed') {
            return res.json({
                status: 'failed',
                error: item.error
            });
        }

        // Re-calculate position if pending
        let position = 0;
        if (item.status === 'pending') {
            position = await ResumeQueue.countDocuments({ 
                status: 'pending', 
                createdAt: { $lt: item.createdAt } 
            }) + 1;
        }

        res.json({
            status: item.status,
            position
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
