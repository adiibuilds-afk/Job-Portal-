const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

router.get('/', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: { $ne: false } });
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newThisWeek = await Job.countDocuments({ createdAt: { $gte: weekAgo } });
    const jobTypeStats = await Job.aggregate([{ $group: { _id: '$jobType', count: { $sum: 1 } } }]);
    const roleTypeStats = await Job.aggregate([{ $group: { _id: '$roleType', count: { $sum: 1 } } }]);
    const popularTags = await Job.aggregate([{ $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]);
    const topCompanies = await Job.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
    const remoteCount = await Job.countDocuments({ isRemote: true });

    res.json({
      totalJobs, newThisWeek, jobTypeStats, roleTypeStats, popularTags,
      topCompanies, remoteCount, onsiteCount: totalJobs - remoteCount
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/salary', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { minSalary: { $gt: 0 }, roleType: { $ne: null } } },
      { $group: { _id: "$roleType", avgSalary: { $avg: "$minSalary" }, minSalary: { $min: "$minSalary" }, maxSalary: { $max: "$minSalary" }, count: { $sum: 1 } } },
      { $sort: { avgSalary: -1 } }
    ]);
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
