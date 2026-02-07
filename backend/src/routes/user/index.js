const express = require('express');
const router = express.Router();

const profileRoutes = require('./profile');
const jobRoutes = require('./jobs');
const coinRoutes = require('./coins');
const referralRoutes = require('./referrals');
const rewardRoutes = require('./rewards');
const activityRoutes = require('./activity');

router.use('/profile', profileRoutes);
router.use('/', activityRoutes);
router.use('/', jobRoutes); // Mount at root for /saved, /applied
router.use('/coins', coinRoutes);
router.use('/referral', referralRoutes);
router.use('/coins', rewardRoutes); // Mount at /coins for reward endpoints

module.exports = router;
