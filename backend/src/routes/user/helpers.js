const crypto = require('crypto');
const User = require('../../models/User');
const CoinTransaction = require('../../models/CoinTransaction');

const generateReferralCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const updateUserTierAndBadges = async (user) => {
    const refs = user.referralCount || 0;
    let oldTier = user.tier || 'Bronze';
    let newTier = 'Bronze';

    if (refs >= 25) newTier = 'Diamond';
    else if (refs >= 10) newTier = 'Gold';
    else if (refs >= 3) newTier = 'Silver';

    if (newTier !== oldTier) {
        user.tier = newTier;
        const badgeName = `${newTier}Member`;
        if (!user.badges.includes(badgeName)) {
            user.badges.push(badgeName);
        }
    }

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
    
    await updateUserTierAndBadges(user);
    return user.gridCoins;
};

module.exports = {
    generateReferralCode,
    updateUserTierAndBadges,
    awardCoins
};
