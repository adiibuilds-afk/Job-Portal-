const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET all posts with search, sort, and category filter
router.get('/posts', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};
    
    if (category && category !== 'all') query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { upvotes: -1, createdAt: -1 };
    if (sort === 'views') sortOption = { views: -1, createdAt: -1 };
    if (sort === 'comments') sortOption = { commentCount: -1, createdAt: -1 };
    
    const posts = await Post.find(query).sort(sortOption).limit(50);
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.views += 1;
    await post.save();
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
    res.json({ post, comments });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE post
router.post('/posts', async (req, res) => {
  try {
    const { title, content, author, category, tags, authorEmail } = req.body;
    const post = new Post({ title, content, author, category, tags, authorEmail });
    await post.save();
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { email, name } = req.query;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Allow delete if email matches OR name matches author
    const isAuthor = post.authorEmail === email || post.author === name || post.author === email;
    if (!isAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Comment.deleteMany({ postId: req.params.id });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TOGGLE UPVOTE post (1 user = 1 vote only)
router.post('/posts/:id/upvote', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Initialize upvotedBy if missing (for legacy posts)
    if (!post.upvotedBy) post.upvotedBy = [];
    
    const hasVoted = post.upvotedBy.includes(email);
    
    if (hasVoted) {
      post.upvotedBy = post.upvotedBy.filter(e => e !== email);
      post.upvotes = Math.max(0, (post.upvotes || 0) - 1);
    } else {
      post.upvotedBy.push(email);
      post.upvotes = (post.upvotes || 0) + 1;
    }
    
    await post.save();
    res.json({ upvotes: post.upvotes, hasVoted: !hasVoted });
  } catch (err) { 
    console.error('Upvote error:', err);
    res.status(500).json({ error: err.message }); 
  }
});

// CREATE comment
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { content, author, authorEmail } = req.body;
    const comment = new Comment({ postId: req.params.id, content, author: author || 'Anonymous', authorEmail });
    await comment.save();
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
    res.status(201).json(comment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const { email, name } = req.query;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    const isAuthor = comment.authorEmail === email || comment.author === name || comment.author === email;
    if (!isAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TOGGLE UPVOTE comment (1 user = 1 vote only)
router.post('/comments/:id/upvote', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Initialize upvotedBy if missing (for legacy comments)
    if (!comment.upvotedBy) comment.upvotedBy = [];
    
    const hasVoted = comment.upvotedBy.includes(email);
    
    if (hasVoted) {
      comment.upvotedBy = comment.upvotedBy.filter(e => e !== email);
      comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
    } else {
      comment.upvotedBy.push(email);
      comment.upvotes = (comment.upvotes || 0) + 1;
    }
    
    await comment.save();
    res.json({ upvotes: comment.upvotes, hasVoted: !hasVoted });
  } catch (err) { 
    console.error('Comment upvote error:', err);
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
