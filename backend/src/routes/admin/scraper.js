const express = require('express');
const router = express.Router();
const ScheduledJob = require('../../models/ScheduledJob');

router.post('/trigger', async (req, res) => {
    try {
        const { runAutoScraper } = require('../../services/scheduler');
        runAutoScraper(req.app.get('bot'));
        res.json({ success: true, message: 'Auto-scraper started in background.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/talentd', async (req, res) => {
    try {
        const { scrapeTalentdJobs } = require('../../services/scraper');
        const { queueLinks } = require('../../services/scheduler');
        const links = await scrapeTalentdJobs();
        const newCount = await queueLinks(links);
        res.json({ success: true, count: newCount, message: `Talentd scraper triggered. Found ${links.length} links, queued ${newCount} new jobs.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger Talentd scraper' });
    }
});

router.post('/rgjobs', async (req, res) => {
    try {
        const { scrapeRgJobs } = require('../../services/scraper');
        const { queueLinks } = require('../../services/scheduler');
        const links = await scrapeRgJobs();
        const newCount = await queueLinks(links);
        res.json({ success: true, count: newCount, message: `RG Jobs triggered. Found ${links.length} links, queued ${newCount} new jobs.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger RG Jobs scraper' });
    }
});

router.delete('/queue/clear', async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const result = await ScheduledJob.deleteMany({ status });
        res.json({ success: true, message: `Cleared ${result.deletedCount} ${status} jobs from queue.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear queue' });
    }
});

module.exports = router;
