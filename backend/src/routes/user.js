const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to mock auth (Replace with real middleware later)
const attachUser = async (req, res, next) => {
    // In production, decode JWT from req.headers.authorization
    const { email } = req.body; // Expect email in body for now
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    
    let user = await User.findOne({ email });
    if (!user) {
        // Auto-create for now if not found (or handle error)
       user = await User.create({ name: 'User', email });
    }
    req.user = user;
    next();
};

// Mark Job as Applied
router.post('/applied', attachUser, async (req, res) => {
    try {
        const { jobId } = req.body;
        const user = req.user;

        // Check if already applied
        const alreadyApplied = user.appliedJobs.some(job => job.jobId.toString() === jobId);
        if (alreadyApplied) {
            return res.json({ message: 'Already marked as applied', appliedJobs: user.appliedJobs });
        }

        user.appliedJobs.push({ jobId });
        await user.save();

        res.json({ message: 'Marked as applied', appliedJobs: user.appliedJobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Profile (Applied + Saved)
router.get('/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await User.findOne({ email })
            .populate('savedJobs')
            .populate('appliedJobs.jobId');
        
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Profile (e.g. Batch, Preferences)
router.put('/profile/update', attachUser, async (req, res) => {
    try {
        const { batch, degree, location } = req.body;
        const user = req.user;

        if (batch) user.batch = batch;
        // Future extensibility
        if (degree) user.degree = degree; 
        if (location) user.location = location;

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
