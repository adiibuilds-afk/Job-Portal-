const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const CoinTransaction = require('../models/CoinTransaction');
const User = require('../models/User');

// Configuration for "Busy Site" simulation
const FAKE_NAMES = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram D.', 'Anjali P.', 'Karthik V.', 'Neha J.', 'Suresh B.', 'Ishita G.'];
const FAKE_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'TCS', 'Zomato', 'Swiggy', 'Infosys', 'Cred', 'Paytm', 'PhonePe'];
const FAKE_ROLES = ['SDE-1', 'Frontend Developer', 'Data Analyst', 'QA Engineer', 'Backend Dev', 'Full Stack Trainee'];

router.get('/activity', async (req, res) => {
    try {
        const activities = [];

        // 1. Get recent Job Posts (last 24h)
        const recentJobs = await Job.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('title company createdAt');
        
        recentJobs.forEach(job => {
            activities.push({
                type: 'job_post',
                message: `New Job: ${job.title} at ${job.company}`,
                time: job.createdAt,
                id: job._id
            });
        });

        // 2. Get recent Coin Transactions (last 1h) - indicates user activity
        const recentCoins = await CoinTransaction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name');

        recentCoins.forEach(tx => {
            let msg = '';
            if (tx.type === 'referral_bonus') msg = `${tx.userId?.name || 'Someone'} earned 10 Coins! 🎁`;
            else if (tx.type === 'job_verification') msg = `${tx.userId?.name || 'Someone'} verified a job status ✅`;
            else if (tx.type === 'share_reward') msg = `${tx.userId?.name || 'Someone'} shared a job on WhatsApp 🚀`;
            else return; // Skip other internal types

            activities.push({
                type: 'user_action',
                message: msg,
                time: tx.createdAt,
                id: tx._id
            });
        });

        // 3. Busy Simulation: If less than 10 activities, add fake ones
        if (activities.length < 10) {
            const needed = 10 - activities.length;
            for (let i = 0; i < needed; i++) {
                const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
                const company = FAKE_COMPANIES[Math.floor(Math.random() * FAKE_COMPANIES.length)];
                const role = FAKE_ROLES[Math.floor(Math.random() * FAKE_ROLES.length)];
                
                const types = [
                    { t: 'apply', m: `${name} just applied to ${company}` },
                    { t: 'save', m: `${name} saved ${role} at ${company}` },
                    { t: 'coin', m: `${name} earned referral coins! 🪙` }
                ];
                const choice = types[Math.floor(Math.random() * types.length)];
                
                activities.push({
                    type: 'simulation',
                    message: choice.m,
                    time: new Date(Date.now() - Math.floor(Math.random() * 3600000)), // Random time within last hour
                    id: 'fake_' + Math.random().toString(36).substr(2, 9)
                });
            }
        }

        // Sort by time descending
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(activities.slice(0, 15));
    } catch (err) {
        console.error('Pulse Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
