const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

router.get('/', async (req, res) => {
    try {
        const { q, category, location, batch, tags, jobType, roleType, minSalary, isRemote, ids, page = 1, limit = 20 } = req.query;
        let query = {};
        if (ids) query._id = { $in: ids.split(',') };
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ];
        }
        if (category) query.category = { $regex: category, $options: 'i' };
        if (location) query.location = { $regex: location, $options: 'i' };
        if (batch) {
            if (batch.startsWith('lt-')) {
                const year = batch.split('-')[1];
                query.batch = { $elemMatch: { $lt: year } };
            } else if (batch.startsWith('gt-')) {
                const year = batch.split('-')[1];
                query.batch = { $elemMatch: { $gt: year } };
            } else {
                query.batch = { $in: [batch] };
            }
        }
        if (tags) query.tags = { $in: [tags] };
        if (jobType) query.jobType = { $regex: jobType, $options: 'i' };
        if (roleType) query.roleType = { $regex: roleType, $options: 'i' };
        if (minSalary) query.minSalary = { $gte: parseInt(minSalary) };
        if (isRemote === 'true') query.isRemote = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const jobs = await Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const total = await Job.countDocuments(query);
        res.json({ jobs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
    try {
        const job = await Job.findOne({ slug: req.params.slug });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        job.views += 1;
        await job.save();
        res.json(job);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/report', async (req, res) => {
    try {
        console.log(`Report received for job ${req.params.id}: ${req.body.reason}`);
        res.json({ success: true, message: 'Job reported successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/click', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        job.clicks += 1;
        await job.save();
        res.json({ success: true, clicks: job.clicks });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/similar', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        const similar = await Job.find({ _id: { $ne: job._id }, $or: [{ roleType: job.roleType }, { tags: { $in: job.tags || [] } }, { batch: { $in: job.batch || [] } }] }).limit(5).sort({ createdAt: -1 });
        res.json(similar);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
