const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const setupBot = require('./bot');
const Job = require('./models/Job');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const app = express();
app.use(cors({
  origin: ['https://jobgrid.in', 'https://www.jobgrid.in', 'http://localhost:3000', 'https://jobgrid-in.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Start Bot
let botInstance = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  botInstance = setupBot(process.env.TELEGRAM_BOT_TOKEN);
  
  // Initialize Scheduler
  const { initScheduler } = require('./services/scheduler');
  initScheduler(botInstance);
} else {
  console.log("Telegram Bot Token not provided, bot not started.");
}

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const resumeRoutes = require('./routes/resume');
app.use('/api/resume', resumeRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/jobs', async (req, res) => {
  try {
    const { q, category, location, batch, tags, jobType, roleType, minSalary, isRemote, ids, page = 1, limit = 20 } = req.query;
    
    let query = {};

    if (ids) {
        query._id = { $in: ids.split(',') };
    }
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Exact match for predefined dropdowns, regex for free text
    if (category) query.category = { $regex: category, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    
    // Engineering Filters
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
    if (tags) query.tags = { $in: [tags] }; // Matches if tags array contains the requested tag
    if (tags) query.tags = { $in: [tags] }; // Matches if tags array contains the requested tag
    if (jobType) query.jobType = { $regex: jobType, $options: 'i' };
    if (roleType) query.roleType = { $regex: roleType, $options: 'i' };
    if (minSalary) query.minSalary = { $gte: parseInt(minSalary) };
    if (isRemote === 'true') query.isRemote = true;

    // Filter out inactive/reported jobs (implied logic: isDetailsVerified or just existence)
    // For now, we assume all jobs are active unless deleted.

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report Job Endpoint
app.post('/api/jobs/:id/report', async (req, res) => {
  try {
    // In a real app, we would track unique reporters to prevent abuse.
    // Here we'll just log it or add a "reportCount" to the schema if we wanted.
    // For MVP, we'll just acknowledge it.
    console.log(`Report received for job ${req.params.id}: ${req.body.reason}`);
    res.json({ success: true, message: 'Job reported successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:slug', async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Increment views
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs/:id/click', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.clicks += 1;
    await job.save();
    res.json({ success: true, clicks: job.clicks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics endpoint (private - for admin)
app.get('/api/analytics', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalViews = await Job.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalClicks = await Job.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);
    const categoryStats = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalJobs,
      totalViews: totalViews[0]?.total || 0,
      totalClicks: totalClicks[0]?.total || 0,
      categoryStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: { $ne: false } });
    
    // Jobs this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newThisWeek = await Job.countDocuments({ createdAt: { $gte: weekAgo } });
    
    // By Job Type
    const jobTypeStats = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);
    
    // By Role Type
    const roleTypeStats = await Job.aggregate([
      { $group: { _id: '$roleType', count: { $sum: 1 } } }
    ]);
    
    // Popular Tags (top 10)
    const popularTags = await Job.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Top Companies (top 5)
    const topCompanies = await Job.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Remote vs Onsite
    const remoteCount = await Job.countDocuments({ isRemote: true });
    
    res.json({
      totalJobs,
      newThisWeek,
      jobTypeStats,
      roleTypeStats,
      popularTags,
      topCompanies,
      remoteCount,
      onsiteCount: totalJobs - remoteCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Similar Jobs endpoint
app.get('/api/jobs/:id/similar', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Find similar jobs by roleType, tags, or batch
    const similar = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { roleType: job.roleType },
        { tags: { $in: job.tags || [] } },
        { batch: { $in: job.batch || [] } }
      ]
    })
    .limit(5)
    .sort({ createdAt: -1 });
    
    res.json(similar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Email subscription endpoint with filters
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, filters } = req.body;
    // TODO: Store in Subscriber model
    console.log('New subscription:', email, filters);
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Recommendations based on saved job IDs
app.post('/api/recommendations', async (req, res) => {
  try {
    const { savedJobIds } = req.body;
    if (!savedJobIds || savedJobIds.length === 0) {
      return res.json([]);
    }
    
    // Get saved jobs
    const savedJobs = await Job.find({ _id: { $in: savedJobIds } });
    
    // Extract common tags and roleTypes
    const allTags = savedJobs.flatMap(j => j.tags || []);
    const allRoles = savedJobs.map(j => j.roleType).filter(Boolean);
    
    // Find similar jobs not in saved list
    const recommendations = await Job.find({
      _id: { $nin: savedJobIds },
      $or: [
        { tags: { $in: allTags } },
        { roleType: { $in: allRoles } }
      ]
    })
    .limit(6)
    .sort({ createdAt: -1 });
    
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== FORUM ROUTES ==========

// Get all posts
app.get('/api/forum/posts', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    
    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post with comments
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.views += 1;
    await post.save();
    
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
    res.json({ post, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new post
app.post('/api/forum/posts', async (req, res) => {
  try {
    const { title, content, author, category, tags } = req.body;
    const post = new Post({ title, content, author, category, tags });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to post
app.post('/api/forum/posts/:id/comments', async (req, res) => {
  try {
    const { content, author } = req.body;
    const comment = new Comment({ 
      postId: req.params.id, 
      content, 
      author: author || 'Anonymous' 
    });
    await comment.save();
    
    // Update comment count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
    
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADMIN QUEUE ROUTES ==========
const ScheduledJob = require('./models/ScheduledJob');

// Get all pending/processed queue items
app.get('/api/admin/queue', async (req, res) => {
  try {
    const queue = await ScheduledJob.find().sort({ scheduledFor: -1 }).limit(100);
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a queue item
app.delete('/api/admin/queue/:id', async (req, res) => {
  try {
    await ScheduledJob.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Queue item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually trigger a queue item
app.post('/api/admin/queue/:id/run', async (req, res) => {
  try {
    const job = await ScheduledJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // In a real app, we'd call the processor function here. 
    // To keep it simple, we'll just set the scheduledFor to NOW and let the cron pick it up in < 1 min.
    job.scheduledFor = new Date();
    await job.save();
    
    res.json({ success: true, message: 'Job scheduled for immediate processing' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SUBSCRIPTION ROUTES ==========
const Subscriber = require('./models/Subscriber');

app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Check if already exists
    let sub = await Subscriber.findOne({ email });
    if (sub) {
      if (!sub.isActive) {
        sub.isActive = true;
        await sub.save();
      }
      return res.json({ success: true, message: 'Already subscribed!' });
    }

    const newSub = new Subscriber({ email });
    await newSub.save();
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    if (err.code === 11000) return res.json({ success: true, message: 'Already subscribed!' });
    res.status(500).json({ error: err.message });
  }
});

// ========== ANALYTICS & CLEANUP ==========
app.get('/api/admin/analytics/detailed', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await Job.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    views: { $sum: "$views" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(dailyStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/cleanup', async (req, res) => {
  try {
    // Basic logic: Delete jobs older than 30 days that aren't featured
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Job.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isFeatured: false
    });
    
    res.json({ success: true, message: `Cleaned up ${result.deletedCount} old jobs.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/debug/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const { scrapeJobPage } = require('./services/scraper');
    const result = await scrapeJobPage(url);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

