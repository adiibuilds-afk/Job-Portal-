const express = require('express');
const router = express.Router();
const CronConfig = require('../../models/CronConfig');

// Default cron jobs to seed if none exist
const DEFAULT_CRONS = [
    {
        name: 'rgjobs_import',
        description: 'Import jobs from RG Jobs API',
        schedule: '0 */2 * * *', // Every 2 hours
        enabled: true
    },
    {
        name: 'talentd_import',
        description: 'Scrape and queue jobs from Talentd',
        schedule: '0 * * * *', // Every hour
        enabled: true
    },
    {
        name: 'queue_processor',
        description: 'Process scheduled job queue',
        schedule: '*/1 * * * *', // Every 1 minute
        enabled: true
    },
    {
        name: 'stale_cleanup',
        description: 'Archive stale/expired jobs',
        schedule: '0 3 * * *', // Daily at 3 AM
        enabled: true
    }
];

// Seed default crons and clean up obsolete ones
const seedDefaults = async () => {
    // Delete obsolete cron entries
    await CronConfig.deleteMany({ name: { $in: ['email_digest', 'telegram_broadcast'] } });
    
    // Update queue_processor to 1 minute if it exists
    await CronConfig.updateOne(
        { name: 'queue_processor' },
        { $set: { schedule: '*/1 * * * *' } }
    );
    
    // Seed defaults if empty
    const count = await CronConfig.countDocuments();
    if (count === 0) {
        await CronConfig.insertMany(DEFAULT_CRONS);
        console.log('🌱 Seeded default cron configurations');
    } else {
        // Ensure talentd_import exists
        const hasTalentd = await CronConfig.findOne({ name: 'talentd_import' });
        if (!hasTalentd) {
            await CronConfig.create({
                name: 'talentd_import',
                description: 'Scrape and queue jobs from Talentd',
                schedule: '0 * * * *',
                enabled: true
            });
            console.log('🌱 Added missing talentd_import configuration');
        }
    }
};
seedDefaults();

// DELETE a cron job
router.delete('/:id', async (req, res) => {
    try {
        const cron = await CronConfig.findByIdAndDelete(req.params.id);
        if (!cron) {
            return res.status(404).json({ error: 'Cron job not found' });
        }
        res.json({ message: 'Cron job deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all cron jobs
router.get('/', async (req, res) => {
    try {
        const crons = await CronConfig.find().sort({ name: 1 });
        res.json(crons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a cron job (schedule, enabled)
router.put('/:id', async (req, res) => {
    try {
        const { schedule, enabled, description } = req.body;
        
        const update = {};
        if (schedule !== undefined) update.schedule = schedule;
        if (enabled !== undefined) update.enabled = enabled;
        if (description !== undefined) update.description = description;
        
        const cron = await CronConfig.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        
        if (!cron) {
            return res.status(404).json({ error: 'Cron job not found' });
        }
        
        res.json(cron);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUN a cron job manually
router.post('/:id/run', async (req, res) => {
    try {
        const cron = await CronConfig.findById(req.params.id);
        if (!cron) {
            return res.status(404).json({ error: 'Cron job not found' });
        }

        // Update status to running
        cron.lastStatus = 'running';
        await cron.save();

        // Execute the job based on name
        let result = { success: false, message: 'Unknown job' };
        
        try {
            switch (cron.name) {
                case 'rgjobs_import':
                    const { importRGJobsDirect } = require('../../scripts/importRGJobs');
                    result = await importRGJobsDirect(10);
                    break;
                    
                case 'talentd_import':
                    const { scrapeTalentdJobs } = require('../../services/scraper');
                    const { queueLinks } = require('../../services/scheduler/queueProcessor');
                    const links = await scrapeTalentdJobs();
                    const queuedCount = await queueLinks(links);
                    result = { success: true, found: links.length, queued: queuedCount };
                    break;
                    
                case 'queue_processor':
                    const { processQueue } = require('../../services/scheduler/queueProcessor');
                    result = await processQueue();
                    break;
                    
                case 'stale_cleanup':
                    const Job = require('../../models/Job');
                    const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
                    const archived = await Job.updateMany(
                        { createdAt: { $lt: cutoff }, isActive: true },
                        { isActive: false }
                    );
                    result = { success: true, archived: archived.modifiedCount };
                    break;
                    
                default:
                    result = { success: false, message: 'Handler not implemented' };
            }
            
            // Update success status
            cron.lastRun = new Date();
            cron.lastStatus = 'success';
            cron.lastError = null;
            cron.runCount += 1;
            await cron.save();
            
        } catch (jobError) {
            cron.lastRun = new Date();
            cron.lastStatus = 'failed';
            cron.lastError = jobError.message;
            await cron.save();
            result = { success: false, error: jobError.message };
        }

        res.json({ cron, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
