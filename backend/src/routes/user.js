const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const crypto = require('crypto');

// Generate unique referral code
const generateReferralCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Middleware to mock auth (Replace with real middleware later)
const attachUser = async (req, res, next) => {
    // In production, decode JWT from req.headers.authorization
    const { email } = req.body; // Expect email in body for now
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    
    let user = await User.findOne({ email });
    if (!user) {
        // Auto-create for now if not found (or handle error)
        const defaultName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        user = await User.create({ name: defaultName, email });
    }
    req.user = user;
    next();
};

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

        // Check if already applied
        const alreadyApplied = user.appliedJobs.some(job => job.jobId.toString() === jobId);
        if (alreadyApplied) {
            return res.json({ message: 'Already marked as applied', appliedJobs: user.appliedJobs });
        }

        const { trackEvent } = require('../services/analytics');
        user.appliedJobs.push({ jobId });
        await user.save();
        await trackEvent('applyClicks');

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
        console.error('Profile API Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Profile (e.g. Batch, Preferences)
router.put('/profile/update', attachUser, async (req, res) => {
    try {
        const { name, batch, degree, location, skills, portfolioUrl } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (batch) user.batch = batch;
        if (degree) user.degree = degree;
        if (location) user.location = location;
        if (skills !== undefined) user.skills = skills;
        if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Activity Heatmap Data (GitHub-style)
router.get('/activity-heatmap', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Aggregate applied jobs by date (last 365 days)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const activityMap = {};

        // Initialize all days in the past year with 0
        for (let d = new Date(oneYearAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            activityMap[dateKey] = 0;
        }

        // Count applications per day
        user.appliedJobs.forEach(app => {
            if (app.appliedAt) {
                const dateKey = new Date(app.appliedAt).toISOString().split('T')[0];
                if (activityMap[dateKey] !== undefined) {
                    activityMap[dateKey]++;
                }
            }
        });

        // Convert to array format
        const heatmapData = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

        res.json({ heatmapData });
    } catch (error) {
        console.error('Heatmap API Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== GRID COINS HELPERS ==========

// Helper: Update User Tier & Check Badges
const updateUserTierAndBadges = async (user) => {
    const refs = user.referralCount || 0;
    let oldTier = user.tier || 'Bronze';
    let newTier = 'Bronze';

    if (refs >= 25) newTier = 'Diamond';
    else if (refs >= 10) newTier = 'Gold';
    else if (refs >= 3) newTier = 'Silver';

    if (newTier !== oldTier) {
        user.tier = newTier;
        // Optionally add a badge for tier up
        const badgeName = `${newTier}Member`;
        if (!user.badges.includes(badgeName)) {
            user.badges.push(badgeName);
        }
    }

    // Streak Badges (Example: 30 day streak)
    if (user.loginStreak >= 30 && !user.badges.includes('StreakMaster')) {
        user.badges.push('StreakMaster');
    }

    await user.save();
};

const awardCoins = async (userId, amount, reason, description) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.gridCoins = (user.gridCoins || 0) + amount;
    await user.save();
    
    await CoinTransaction.create({
        userId,
        type: 'earn',
        amount,
        reason,
        description
    });
    
    // Trigger Tier update
    await updateUserTierAndBadges(user);
    
    return user.gridCoins;
};

// Get Coins Balance & Stats
router.get('/coins', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate referral code if not exists
        if (!user.referralCode) {
            user.referralCode = generateReferralCode();
            await user.save();
        }

        // Get recent transactions
        const transactions = await CoinTransaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            balance: user.gridCoins || 0,
            referralCode: user.referralCode,
            referralCount: user.referralCount || 0,
            loginStreak: user.loginStreak || 0,
            tier: user.tier || 'Bronze',
            badges: user.badges || [],
            profileRewardsClaimed: user.profileRewardsClaimed || [],
            skills: user.skills || [],
            portfolioUrl: user.portfolioUrl || '',
            transactions
        });
    } catch (error) {
        console.error('Coins API Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Validate and Apply Referral Code (called during signup)
router.post('/referral/apply', async (req, res) => {
    try {
        const { email, referralCode } = req.body;
        if (!email || !referralCode) {
            return res.status(400).json({ error: 'Email and referral code required' });
        }

        // Find referrer
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrer) {
            return res.status(404).json({ error: 'Invalid referral code' });
        }

        // Find or create new user
        let user = await User.findOne({ email });
        if (!user) {
            const defaultName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            user = await User.create({ 
                name: defaultName, 
                email, 
                referralCode: generateReferralCode(),
                referredBy: referrer._id,
                gridCoins: 2.5 // Signup bonus
            });
            
            // Log transaction for new user
            await CoinTransaction.create({
                userId: user._id,
                type: 'earn',
                amount: 2.5,
                reason: 'signup',
                description: 'Welcome bonus with referral'
            });
        } else if (user.referredBy) {
            return res.json({ success: false, message: 'Already used a referral code' });
        } else {
            // Existing user applying referral
            user.referredBy = referrer._id;
            user.gridCoins = (user.gridCoins || 0) + 2.5;
            await user.save();
            
            await CoinTransaction.create({
                userId: user._id,
                type: 'earn',
                amount: 2.5,
                reason: 'signup',
                description: 'Referral bonus applied'
            });
        }

        // Award referrer
        referrer.gridCoins = (referrer.gridCoins || 0) + 5;
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        
        await CoinTransaction.create({
            userId: referrer._id,
            type: 'earn',
            amount: 5,
            reason: 'referral',
            description: `Referred ${email}`
        });

        // Trigger updates
        await updateUserTierAndBadges(referrer);
        await updateUserTierAndBadges(user);

        res.json({ 
            success: true, 
            userCoins: user.gridCoins,
            message: 'Referral applied! You got 2.5 coins.'
        });
    } catch (error) {
        console.error('Referral Apply Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Track Daily Login (7-day streak = 10 coins)
router.post('/coins/login', attachUser, async (req, res) => {
    try {
        const user = req.user;
        const today = new Date().toDateString();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;

        if (lastLogin === today) {
            return res.json({ message: 'Already logged in today', streak: user.loginStreak });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastLogin === yesterday.toDateString();

        if (isConsecutive) {
            user.loginStreak = (user.loginStreak || 0) + 1;
        } else {
            user.loginStreak = 1; // Reset streak
        }

        user.lastLoginDate = new Date();

        // Award 10 coins on 7-day streak
        if (user.loginStreak === 7) {
            user.gridCoins = (user.gridCoins || 0) + 10;
            user.loginStreak = 0; // Reset for next cycle

            await CoinTransaction.create({
                userId: user._id,
                type: 'earn',
                amount: 10,
                reason: 'login_streak',
                description: '7-day login streak bonus!'
            });

            await user.save();
            await updateUserTierAndBadges(user); // Check for streak badges
            return res.json({ 
                message: '🎉 7-day streak! +10 coins!', 
                streak: 0, 
                coinsAwarded: 10,
                balance: user.gridCoins 
            });
        }

        await user.save();
        res.json({ message: 'Login tracked', streak: user.loginStreak });
    } catch (error) {
        console.error('Login Streak Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Award coins for sharing job (2 coins, max 20/week)
router.post('/coins/share', attachUser, async (req, res) => {
    try {
        const user = req.user;
        const now = new Date();

        // Reset weekly counter if needed
        const resetDate = user.weeklySharesReset ? new Date(user.weeklySharesReset) : new Date(0);
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        
        if (now - resetDate > weekMs) {
            user.weeklyShares = 0;
            user.weeklySharesReset = now;
        }

        // Check weekly limit (max 10 shares = 20 coins)
        if ((user.weeklyShares || 0) >= 10) {
            return res.json({ 
                success: false, 
                message: 'Weekly share limit reached (20 coins max)',
                balance: user.gridCoins
            });
        }

        user.weeklyShares = (user.weeklyShares || 0) + 1;
        user.gridCoins = (user.gridCoins || 0) + 2;
        await user.save();

        await CoinTransaction.create({
            userId: user._id,
            type: 'earn',
            amount: 2,
            reason: 'share_job',
            description: 'Shared job on social media'
        });

        res.json({ 
            success: true, 
            coinsAwarded: 2,
            sharesThisWeek: user.weeklyShares,
            balance: user.gridCoins
        });
    } catch (error) {
        console.error('Share Reward Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== ADVANCED GAMIFICATION & ENGAGEMENT ==========


// GET Weekly Referral Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topReferrers = await User.find()
            .select('name email referralCount tier badges')
            .sort({ referralCount: -1 })
            .limit(10);

        res.json({ leaderboard: topReferrers });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Award Coins for Profile Completion
router.post('/coins/profile-award', attachUser, async (req, res) => {
    try {
        const { type } = req.body; // 'skills' or 'portfolio'
        const user = req.user;

        if (user.profileRewardsClaimed.includes(type)) {
            return res.json({ success: false, message: 'Reward already claimed' });
        }

        let amount = 0;
        let description = '';

        if (type === 'skills') {
            amount = 3; // Finalized Value
            description = 'Completed skills profile';
        } else if (type === 'portfolio') {
            amount = 2; // Finalized Value
            description = 'Added portfolio link';
        } else {
            return res.status(400).json({ error: 'Invalid reward type' });
        }

        user.gridCoins = (user.gridCoins || 0) + amount;
        user.profileRewardsClaimed.push(type);
        await user.save();

        await CoinTransaction.create({
            userId: user._id,
            type: 'earn',
            amount,
            reason: `profile_${type}`,
            description
        });

        res.json({ success: true, amount, balance: user.gridCoins });
    } catch (error) {
        console.error('Profile Award Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Redeem Coins for Perks
router.post('/coins/redeem', attachUser, async (req, res) => {
    try {
        const { perk } = req.body; // 'ai_scan', 'boost_app', 'mystery_box'
        const user = req.user;

        let cost = 0;
        let description = '';

        if (perk === 'ai_scan') {
            cost = 10; // Finalized Value
            description = 'Redeemed AI Resume Scan';
        } else if (perk === 'mystery_box') {
            cost = 20; // Finalized Value
            description = 'Purchased Mystery Box';
        } else {
            return res.status(400).json({ error: 'Perk not available' });
        }

        if (user.gridCoins < cost) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }

        user.gridCoins -= cost;
        await user.save();

        await CoinTransaction.create({
            userId: user._id,
            type: 'spend',
            amount: cost,
            reason: `redeem_${perk}`,
            description
        });

        // Mystery Box Logic (Immediate reward if mystery box)
        let mysteryReward = null;
        if (perk === 'mystery_box') {
            const possibleRewards = [5, 10, 15, 20, 50];
            mysteryReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
            
            user.gridCoins += mysteryReward;
            await user.save();
            
            await CoinTransaction.create({
                userId: user._id,
                type: 'earn',
                amount: mysteryReward,
                reason: 'mystery_reward',
                description: 'Mystery Box Reward!'
            });
        }

        res.json({ 
            success: true, 
            message: `Successfully redeemed ${perk}`, 
            balance: user.gridCoins,
            mysteryReward
        });
    } catch (error) {
        console.error('Redeem Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Award Coins for Successful Hire (Placeholder for admin/recruiter trigger)
router.post('/coins/hire-reward', attachUser, async (req, res) => {
    return res.status(403).json({ error: 'This feature is currently disabled' });
    /*
    try {
        const { candidateEmail } = req.body;
        const amount = 0; // Not available now
        
        const candidate = await User.findOne({ email: candidateEmail });
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
        
        candidate.gridCoins = (candidate.gridCoins || 0) + amount;
        await candidate.save();
        
        await CoinTransaction.create({
            userId: candidate._id,
            type: 'earn',
            amount,
            reason: 'hired',
            description: 'Bonus for being successfully hired through JobGrid!'
        });
        
        res.json({ success: true, message: 'Hire reward awarded!', balance: candidate.gridCoins });
    } catch (error) {
        console.error('Hire Reward Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
    */
});

module.exports = router;
