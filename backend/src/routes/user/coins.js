const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const CoinTransaction = require('../../models/CoinTransaction');
const Settings = require('../../models/Settings');
const { attachUser } = require('./middleware');
const { generateReferralCode, updateUserTierAndBadges } = require('./helpers');

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({ gridCoins: { $gt: 0 } })
            .sort({ gridCoins: -1 })
            .limit(10)
            .select('name email gridCoins tier badges avatar');
            
        const leaderboard = topUsers.map((u, i) => ({
            _id: u._id,
            rank: i + 1,
            name: u.name || 'Anonymous',
            email: u.email,
            coins: u.gridCoins,
            tier: u.tier || 'Bronze',
            badges: u.badges || [],
            avatar: u.avatar
        }));

        res.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Coins Balance & Stats
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.referralCode) {
            user.referralCode = generateReferralCode();
            await user.save();
        }

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

// Track Daily Login
router.post('/login', attachUser, async (req, res) => {
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
            user.loginStreak = 1;
        }

        user.lastLoginDate = new Date();

        if (user.loginStreak === 7) {
            user.gridCoins = (user.gridCoins || 0) + 10;
            user.loginStreak = 0; 

            await CoinTransaction.create({
                userId: user._id,
                type: 'earn',
                amount: 10,
                reason: 'login_streak',
                description: '7-day login streak bonus!'
            });

            await user.save();
            await updateUserTierAndBadges(user);
            return res.json({ message: '🎉 7-day streak! +10 coins!', streak: 0, coinsAwarded: 10, balance: user.gridCoins });
        }

        await user.save();
        res.json({ message: 'Login tracked', streak: user.loginStreak });
    } catch (error) {
        console.error('Login Streak Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Award coins for sharing job
router.post('/share', attachUser, async (req, res) => {
    try {
        const user = req.user;
        const now = new Date();

        const resetDate = user.weeklySharesReset ? new Date(user.weeklySharesReset) : new Date(0);
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        
        if (now - resetDate > weekMs) {
            user.weeklyShares = 0;
            user.weeklySharesReset = now;
        }

        if ((user.weeklyShares || 0) >= 10) {
            return res.json({ success: false, message: 'Weekly limit reached', balance: user.gridCoins });
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

        res.json({ success: true, coinsAwarded: 2, sharesThisWeek: user.weeklyShares, balance: user.gridCoins });
    } catch (error) {
        console.error('Share Reward Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
