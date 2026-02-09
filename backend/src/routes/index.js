const express = require('express');
const router = express.Router();

// Import modular routes
const userRoutes = require('./user');
const adminRoutes = require('./admin');
const analyticsRoutes = require('./analytics');
const jobRoutes = require('./jobs');
const statsRoutes = require('./stats');
const forumRoutes = require('./forum');
const resumeRoutes = require('./resume');
const adminAuthRoutes = require('./adminAuth');
const authRoutes = require('./auth');

// Mount routes
router.use('/auth', authRoutes); // Public auth (Google, etc)
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/cron', require('./admin/cron'));
router.use('/admin/email', require('./admin/email'));
router.use('/analytics', analyticsRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/jobs', jobRoutes);
router.use('/stats', statsRoutes);
router.use('/forum', forumRoutes);
router.use('/resume', resumeRoutes);

// Shared job recommendation routes
const Job = require('../models/Job');
router.post('/recommendations', async (req, res) => {
  try {
    const { savedJobIds } = req.body;
    if (!savedJobIds || savedJobIds.length === 0) return res.json([]);
    const savedJobs = await Job.find({ _id: { $in: savedJobIds } });
    const allTags = savedJobs.flatMap(j => j.tags || []);
    const allRoles = savedJobs.map(j => j.roleType).filter(Boolean);
    const recommendations = await Job.find({ _id: { $nin: savedJobIds }, $or: [{ tags: { $in: allTags } }, { roleType: { $in: allRoles } }] }).limit(6).sort({ createdAt: -1 });
    res.json(recommendations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Subscription route with batch support
const { sendWelcomeEmail } = require('../services/email');
const Subscriber = require('../models/Subscriber');
router.post('/subscribe', async (req, res) => {
  try {
    const { email, batch } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!batch) return res.status(400).json({ error: 'Batch is required' });
    
    let sub = await Subscriber.findOne({ email });
    if (sub) {
      if (!sub.isActive || sub.batch !== batch) { 
        sub.isActive = true; 
        sub.batch = batch;
        await sub.save(); 
        return res.json({ success: true, message: 'Subscription updated!' });
      }
      return res.json({ success: true, message: 'Already subscribed!' });
    }
    const newSub = new Subscriber({ email, batch });
    await newSub.save();
    sendWelcomeEmail(email).catch(e => console.error(e));
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
