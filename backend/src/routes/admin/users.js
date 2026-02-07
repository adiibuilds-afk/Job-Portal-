const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};
        const users = await User.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).select('-password');
        const total = await User.countDocuments(query);
        res.json({ users, totalPages: Math.ceil(total / limit), currentPage: page, totalUsers: total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { tier, gridCoins, name } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (tier) user.tier = tier;
        if (gridCoins !== undefined) user.gridCoins = gridCoins;
        if (name) user.name = name;
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
