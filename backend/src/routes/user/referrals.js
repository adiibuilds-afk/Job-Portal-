const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const CoinTransaction = require('../../models/CoinTransaction');
const { generateReferralCode, updateUserTierAndBadges } = require('./helpers');

// Validate and Apply Referral Code
router.post('/apply', async (req, res) => {
    try {
        const { email, referralCode } = req.body;
        if (!email || !referralCode) {
            return res.status(400).json({ error: 'Email and referral code required' });
        }

        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrer) {
            return res.status(404).json({ error: 'Invalid referral code' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            const defaultName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            user = await User.create({ 
                name: defaultName, 
                email, 
                referralCode: generateReferralCode(),
                referredBy: referrer._id,
                gridCoins: 2.5 
            });
            
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

        referrer.gridCoins = (referrer.gridCoins || 0) + 5;
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        await referrer.save();
        
        await CoinTransaction.create({
            userId: referrer._id,
            type: 'earn',
            amount: 5,
            reason: 'referral',
            description: `Referred ${email}`
        });

        await updateUserTierAndBadges(referrer);
        await updateUserTierAndBadges(user);

        res.json({ success: true, userCoins: user.gridCoins, message: 'Referral applied!' });
    } catch (error) {
        console.error('Referral Apply Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

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

module.exports = router;
