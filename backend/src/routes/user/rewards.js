const express = require('express');
const router = express.Router();
const CoinTransaction = require('../../models/CoinTransaction');
const { attachUser } = require('./middleware');

// Award Coins for Profile Completion
router.post('/profile-award', attachUser, async (req, res) => {
    try {
        const { type } = req.body; 
        const user = req.user;

        if (user.profileRewardsClaimed.includes(type)) {
            return res.json({ success: false, message: 'Reward already claimed' });
        }

        let amount = 0;
        let description = '';

        if (type === 'skills') {
            amount = 3; 
            description = 'Completed skills profile';
        } else if (type === 'portfolio') {
            amount = 2; 
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
router.post('/redeem', attachUser, async (req, res) => {
    try {
        const { perk } = req.body; 
        const user = req.user;

        let cost = 0;
        let description = '';

        if (perk === 'ai_scan') {
            cost = 10; 
            description = 'Redeemed AI Resume Scan';
        } else if (perk === 'mystery_box') {
            cost = 20; 
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

        let mysteryReward = null;
        if (perk === 'mystery_box') {
            const possibleRewards = [5, 10, 15, 20, 50];
            mysteryReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
            user.gridCoins += mysteryReward;
            await user.save();
            await CoinTransaction.create({
                userId: user._id,
                type: 'earn', amount: mysteryReward, reason: 'mystery_reward', description: 'Mystery Box Reward!'
            });
        }

        res.json({ success: true, balance: user.gridCoins, mysteryReward });
    } catch (error) {
        console.error('REDEEM ENDPOINT ERROR:', error); // MORE VISIBLE LOGGING
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

module.exports = router;
