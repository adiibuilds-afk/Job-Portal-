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
        const { runAutoScraper } = require('../services/scheduler');
        // runAutoScraper is async, we start it but don't wait for total completion if it's long
        // but for manual feedback, we can wait a bit
        runAutoScraper(req.app.get('bot'));
        res.json({ success: true, message: 'Talentd scraper triggered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger scraper' });
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

module.exports = router;
