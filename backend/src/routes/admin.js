const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Targeted Batch Alerts
router.post('/alerts/batch', async (req, res) => {
    try {
        const { batch, message } = req.body;
        
        if (!batch || !message) {
            return res.status(400).json({ error: 'Batch and Message are required' });
        }

        // Find users with this batch
        // Note: In real app, we would query the User model.
        // Assuming your User model has 'batch' field.
        const users = await User.find({ batch });
        const count = users.length;

        console.log(`[ALERT SYSTEM] Sending to ${count} users of batch ${batch}`);
        console.log(`[MESSAGE] "${message}"`);

        // Mock sending process
        // In production: await emailService.sendBatch(users, message);

        res.json({ success: true, count, message: 'Alerts queued successfully' });

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
        runAutoScraper();
        
        res.json({ success: true, message: 'Auto-scraper started in background.' });
    } catch (error) {
        console.error('Trigger Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
