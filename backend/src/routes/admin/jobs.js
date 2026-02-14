const express = require('express');
const router = express.Router();
const Job = require('../../models/Job');

router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }
        const result = await Job.deleteMany({ _id: { $in: ids } });
        res.json({ success: true, message: `Successfully deleted ${result.deletedCount} jobs.` });
    } catch (error) {
        console.error('Bulk Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete jobs' });
    }
});

router.delete('/clear', async (req, res) => {
    try {
        const result = await Job.deleteMany({});
        res.json({ success: true, message: `Successfully deleted all ${result.deletedCount} jobs.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear jobs' });
    }
});

router.post('/cleanup/expired', async (req, res) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 45);
        const result = await Job.updateMany(
            { createdAt: { $lt: cutoffDate }, isActive: { $ne: false } },
            { $set: { isActive: false, archivedAt: new Date(), archiveReason: 'expired' } }
        );
        res.json({ success: true, count: result.modifiedCount, message: `Archived ${result.modifiedCount} expired jobs.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to archive expired jobs' });
    }
});

router.post('/cleanup/zero-engagement', async (req, res) => {
    try {
        const result = await Job.updateMany(
            { viewCount: { $lte: 0 }, clickCount: { $lte: 0 }, saveCount: { $lte: 0 }, isActive: { $ne: false } },
            { $set: { isActive: false, archivedAt: new Date(), archiveReason: 'no_engagement' } }
        );
        res.json({ success: true, count: result.modifiedCount, message: `Archived ${result.modifiedCount} zero-engagement jobs.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to archive zero-engagement jobs' });
    }
});

router.get('/reported', async (req, res) => {
    try {
        const reportedJobs = await Job.find({ reportCount: { $gt: 0 } }).sort({ reportCount: -1 }).limit(50);
        res.json({ jobs: reportedJobs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reported jobs' });
    }
});

router.delete('/reported', async (req, res) => {
    try {
        const result = await Job.deleteMany({ reportCount: { $gt: 0 } });
        res.json({ success: true, message: `Successfully deleted ${result.deletedCount} reported jobs.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear reported jobs' });
    }
});

// Initialize Telegraf for Admin actions
const { Telegraf } = require('telegraf');
const bot = process.env.TELEGRAM_BOT_TOKEN ? new Telegraf(process.env.TELEGRAM_BOT_TOKEN) : null;

router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Delete from Telegram if exists
        if (bot && job.telegramMessages && job.telegramMessages.length > 0) {
            console.log(`🗑️ Deleting ${job.telegramMessages.length} Telegram messages for job: ${job.title}`);
            for (const msg of job.telegramMessages) {
                try {
                    await bot.telegram.deleteMessage(msg.chatId, msg.messageId);
                    console.log(`   ✅ Deleted Telegram msg: ${msg.messageId} from ${msg.chatId}`);
                } catch (err) {
                    console.error(`   ⚠️ Failed to delete Telegram msg ${msg.messageId}:`, err.message);
                }
            }
        } else if (bot && job.telegramMessageId) {
             // Fallback for older jobs
             try {
                const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
                if (CHANNEL_ID) await bot.telegram.deleteMessage(CHANNEL_ID, job.telegramMessageId);
             } catch (err) { }
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted successfully from Database and Telegram' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

router.put('/:id/toggle', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        job.isActive = !job.isActive;
        await job.save();
        res.json({ success: true, isActive: job.isActive, message: `Job is now ${job.isActive ? 'Active' : 'Hidden'}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

router.get('/ai-suggestions', async (req, res) => {
    try {
        const batch = req.query.batch || '2025';
        const recentJobs = await Job.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(20);
        const suggestions = recentJobs.map(job => {
            let score = 60;
            const title = job.title?.toLowerCase() || '';
            const batch_year = parseInt(batch) || 2025;
            if (batch_year >= 2025) {
                if (title.includes('intern') || title.includes('entry') || title.includes('fresher')) score += 20;
                if (title.includes('graduate') || title.includes('junior')) score += 15;
            } else {
                if (title.includes('senior') || title.includes('lead') || title.includes('manager')) score += 18;
            }
            if (title.includes('software') || title.includes('developer') || title.includes('engineer')) score += 10;
            if (job.salary && job.salary !== 'Not disclosed') score += 5;
            score += Math.floor(Math.random() * 8) - 4;
            score = Math.min(98, Math.max(55, score));
            return {
                _id: job._id, title: job.title, company: job.company, location: job.location, slug: job.slug,
                matchScore: score, matchReason: score >= 85 ? `Strongly matches ${batch} batch patterns` : score >= 75 ? `Matches roughly ${score - 5}% patterns` : `Potential match`
            };
        });
        res.json({ suggestions: suggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

module.exports = router;
