const express = require('express');
const router = express.Router();
const { attachUser } = require('./middleware');

// Toggle Job in Saved List
router.post('/saved', attachUser, async (req, res) => {
    try {
        const { jobId } = req.body;
        const user = req.user;

        const index = user.savedJobs.findIndex(id => id.toString() === jobId);
        if (index > -1) {
            user.savedJobs.splice(index, 1);
            await user.save();
            return res.json({ message: 'Removed from saved', savedJobs: user.savedJobs });
        } else {
            user.savedJobs.push(jobId);
            await user.save();
            return res.json({ message: 'Added to saved', savedJobs: user.savedJobs });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark Job as Applied
router.post('/applied', attachUser, async (req, res) => {
    try {
        const { jobId } = req.body;
        const user = req.user;

        const alreadyApplied = user.appliedJobs.some(job => job.jobId.toString() === jobId);
        if (alreadyApplied) {
            return res.json({ message: 'Already marked as applied', appliedJobs: user.appliedJobs });
        }

        const { trackEvent } = require('../../services/analytics');
        user.appliedJobs.push({ jobId });
        await user.save();
        
        // Tracking click for heatmap/stats
        try {
            await trackEvent('applyClicks');
        } catch(e) {}

        res.json({ message: 'Marked as applied', appliedJobs: user.appliedJobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove Job from Applied List (Un-apply)
router.delete('/applied/:jobId', attachUser, async (req, res) => {
    try {
        const { jobId } = req.params;
        const user = req.user;

        const initialLength = user.appliedJobs.length;
        user.appliedJobs = user.appliedJobs.filter(job => job.jobId.toString() !== jobId);
        
        if (user.appliedJobs.length === initialLength) {
            return res.status(404).json({ error: 'Application record not found' });
        }

        await user.save();
        res.json({ message: 'Removed from applied list', appliedJobs: user.appliedJobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Applied Job Status
router.put('/applied/status', attachUser, async (req, res) => {
    try {
        const { jobId, status, notes } = req.body;
        const user = req.user;

        const validStatuses = ['applied', 'interviewing', 'offered', 'rejected'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = user.appliedJobs.find(a => a.jobId.toString() === jobId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (status) application.status = status;
        if (notes !== undefined) application.notes = notes;
        application.updatedAt = new Date();
        
        await user.save();

        res.json({ success: true, appliedJobs: user.appliedJobs });
    } catch (error) {
        console.error('Status Update Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bulk Update Applied Job Status
router.put('/applied/status/bulk', attachUser, async (req, res) => {
    try {
        const { jobIds, status } = req.body;
        const user = req.user;

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return res.status(400).json({ error: 'Invalid job IDs' });
        }

        const validStatuses = ['applied', 'interviewing', 'offered', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let updatedCount = 0;
        user.appliedJobs.forEach(app => {
            if (jobIds.includes(app.jobId.toString())) {
                app.status = status;
                app.updatedAt = new Date();
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await user.save();
        }

        res.json({ success: true, message: `Updated ${updatedCount} jobs`, appliedJobs: user.appliedJobs });
    } catch (error) {
        console.error('Bulk Status Update Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// verify-job route
router.post('/verify-job', attachUser, async (req, res) => {
    try {
        const { jobId, status } = req.body;
        const user = req.user;
        const Job = require('../../models/Job');
        const CoinTransaction = require('../../models/CoinTransaction');

        // Check if user already verified this job in logs
        const alreadyVerified = user.activityLogs.some(log => 
            log.action === 'verify_job' && log.jobId?.toString() === jobId
        );

        if (alreadyVerified) {
            return res.status(400).json({ message: 'Already verified this job!' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Update Job Verification Stats
        if (!job.verifications) job.verifications = { stillHiring: 0, notHiring: 0 };
        
        if (status === 'still_hiring') {
            job.verifications.stillHiring += 1;
        } else if (status === 'not_hiring') {
            job.verifications.notHiring += 1;
        }
        job.lastVerifiedAt = new Date();
        await job.save();

        // Award Coins
        const awardAmount = status === 'still_hiring' ? 1 : 1; // Simplified for now
        user.gridCoins = (user.gridCoins || 0) + awardAmount;
        
        // Log Activity
        user.activityLogs.push({
            action: 'verify_job',
            jobId,
            metadata: { status, coinsAwarded: awardAmount },
            timestamp: new Date()
        });

        await user.save();

        // Create Transaction Record
        await CoinTransaction.create({
            userId: user._id,
            type: 'earn',
            amount: awardAmount,
            reason: 'verify_job',
            description: `Verified job status: ${status}`
        });

        res.json({ success: true, earned: awardAmount, balance: user.gridCoins });
    } catch (error) {
        console.error('Verify Job Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
