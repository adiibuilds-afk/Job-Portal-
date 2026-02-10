const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const CoinTransaction = require('../models/CoinTransaction');
const User = require('../models/User');

// Configuration for "Busy Site" simulation
const FAKE_NAMES = [
    'Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram D.', 'Anjali P.', 'Karthik V.', 'Neha J.', 'Suresh B.', 'Ishita G.',
    'Arjun M.', 'Divya K.', 'Rohan P.', 'Sanya V.', 'Manish T.', 'Kavita L.', 'Aditya H.', 'Pooja B.', 'Sameer C.', 'Tanvi S.',
    'Aakash R.', 'Meera N.', 'Vivek G.', 'Shweta A.', 'Deepak Y.', 'Ritu F.', 'Abhishek D.', 'Kiran E.', 'Pranav W.', 'Ananya Q.',
    'Harish Z.', 'Mansi X.', 'Yash V.', 'Bhavna J.', 'Rajat K.', 'Priti L.', 'Sunny O.', 'Isha P.', 'Varun M.', 'Komal U.',
    'Abhay T.', 'Nidhi S.', 'Gaurav R.', 'Rashi Q.', 'Pankaj P.', 'Jyoti O.', 'Tushar N.', 'Shilpa M.', 'Mayank L.', 'Ankita K.'
];
const FAKE_COMPANIES = [
    'Google', 'Amazon', 'Microsoft', 'TCS', 'Zomato', 'Swiggy', 'Infosys', 'Cred', 'Paytm', 'PhonePe',
    'Adobe', 'Uber', 'Ola', 'Flipkart', 'Cisco', 'Intuit', 'Salesforce', 'ServiceNow', 'Oracle', 'IBM',
    'Morgan Stanley', 'Goldman Sachs', 'JP Morgan', 'DE Shaw', 'Atlassian', 'Twilio', 'Stripe', 'Airbnb', 'Netflix', 'Meta'
];
const FAKE_ROLES = [
    'SDE-1', 'Frontend Developer', 'Data Analyst', 'QA Engineer', 'Backend Dev', 'Full Stack Trainee',
    'DevOps Intern', 'UI/UX Designer', 'Product Manager', 'Systems Engineer', 'Cloud Architect', 'Security Analyst',
    'Mobile Dev (React Native)', 'Java Developer', 'Python Dev', 'ML Intern', 'Embedded Engineer', 'Network Admin'
];

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
            if (tx.reason === 'referral') msg = `${tx.userId?.name || 'Someone'} referred a new user! 🎁`;
            else if (tx.reason === 'signup' && tx.description.includes('referral')) msg = `${tx.userId?.name || 'Someone'} joined via referral! ✨`;
            else if (tx.reason === 'share_reward') msg = `${tx.userId?.name || 'Someone'} shared a job on WhatsApp 🚀`;
            else if (tx.reason === 'daily_visit') msg = `${tx.userId?.name || 'Someone'} is active on JobGrid 🔥`;
            else if (tx.reason === 'milestone') msg = `${tx.userId?.name || 'Someone'} reached a referral milestone! 🏆`;
            else if (tx.reason === 'verify_job') msg = `${tx.userId?.name || 'Someone'} verified a job status! ✅`;
            else return; // Skip other internal types

            activities.push({
                type: 'user_action',
                message: msg,
                time: tx.createdAt,
                id: tx._id
            });
        });

        // 3. Busy Simulation: If less than 20 activities, add fake ones
        if (activities.length < 20) {
            const needed = 20 - activities.length;
            for (let i = 0; i < needed; i++) {
                const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
                const company = FAKE_COMPANIES[Math.floor(Math.random() * FAKE_COMPANIES.length)];
                const role = FAKE_ROLES[Math.floor(Math.random() * FAKE_ROLES.length)];
                
                const types = [
                    { t: 'apply', m: `${name} just applied to ${company}` },
                    { t: 'save', m: `${name} saved ${role} at ${company}` },
                    { t: 'coin', m: `${name} invited a friend to JobGrid! 🎁` },
                    { t: 'join', m: `${name} joined JobGrid via referral! 🚀` },
                    { t: 'share', m: `${name} shared a job with their batch! 📲` }
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

        res.json(activities.slice(0, 20));
    } catch (err) {
        console.error('Pulse Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
