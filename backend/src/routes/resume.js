const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { analyzeResume } = require('../utils/resumeAnalyzer');

// Analyze Resume
router.post('/analyze', async (req, res) => {
    try {
        const { jobId, resumeText } = req.body;

        if (!jobId || !resumeText) {
            return res.status(400).json({ error: 'Job ID and Resume Text are required' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const result = analyzeResume(resumeText, job.description, job.tags || []);

        res.json({
            success: true,
            jobTitle: job.title,
            ...result
        });

    } catch (error) {
        console.error('Resume Analysis Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
