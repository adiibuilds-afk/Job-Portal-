const express = require('express');
const router = express.Router();
const ScheduledJob = require('../../models/ScheduledJob');

// Source Services
const { runRGJobsManual } = require('../../services/sources/rgjobs');
const { runTalentdManual } = require('../../services/sources/talentd');
const { runKrishnaKumarManual } = require('../../services/sources/krishnakumar');
const { runInternFreakManual } = require('../../services/sources/internfreak');

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
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const result = await runTalentdManual(bot, limit);
        res.json({ success: true, ...result, message: `Talentd Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run Talentd scraper' });
    }
});

router.post('/rgjobs', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const result = await runRGJobsManual(bot, limit);
        res.json({ success: true, ...result, message: `RG Jobs Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run RG Jobs scraper' });
    }
});

router.post('/krishnakumar', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const result = await runKrishnaKumarManual(bot, limit);
        res.json({ success: true, ...result, message: `KrishnaKumar Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run KrishnaKumar scraper' });
    }
});

router.post('/internfreak', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const result = await runInternFreakManual(bot, limit);
        res.json({ success: true, ...result, message: `InternFreak Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run InternFreak scraper' });
    }
});

router.post('/gocareers', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const { runGoCareersManual } = require('../../services/sources/gocareers');
        const result = await runGoCareersManual(bot, limit);
        res.json({ success: true, ...result, message: `GoCareers Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run GoCareers scraper' });
    }
});

router.post('/offcampus', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const { runOffcampusManual } = require('../../services/sources/offcampus');
        const result = await runOffcampusManual(bot, limit);
        res.json({ success: true, ...result, message: `Offcampus Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run Offcampus scraper' });
    }
});

router.post('/dotaware', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const { runDotAwareManual } = require('../../services/sources/dotaware');
        const result = await runDotAwareManual(bot, limit);
        res.json({ success: true, ...result, message: `DotAware Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run DotAware scraper' });
    }
});

router.post('/fresheroffcampus', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const { runFresherOffCampusManual } = require('../../services/sources/fresheroffcampus');
        const result = await runFresherOffCampusManual(bot, limit);
        res.json({ success: true, ...result, message: `FresherOffCampus Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run FresherOffCampus scraper' });
    }
});

router.post('/freshersjobsaadda', async (req, res) => {
    try {
        const bot = req.app.get('bot');
        const limit = req.body.limit ? parseInt(req.body.limit) : 20;
        const { runFreshersJobsAaddaManual } = require('../../services/sources/freshersjobsaadda');
        const result = await runFreshersJobsAaddaManual(bot, limit);
        res.json({ success: true, ...result, message: `FreshersJobsAadda Manual: Processed ${result.processed}, Skipped ${result.skipped}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run FreshersJobsAadda scraper' });
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
