const express = require('express');
const router = express.Router();

const statsRoutes = require('./stats');
const jobRoutes = require('./jobs');
const userRoutes = require('./users');
const scraperRoutes = require('./scraper');
const settingRoutes = require('./settings');
const alertRoutes = require('./alerts');

router.use('/stats', statsRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/scraper', scraperRoutes);
router.use('/settings', settingRoutes);
router.use('/alerts', alertRoutes);

// Aliases for backward compatibility or direct dashboard access
router.use('/', statsRoutes); 

module.exports = router;
