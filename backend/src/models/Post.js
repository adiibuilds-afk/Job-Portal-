const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
  authorEmail: { type: String },
  category: { type: String, default: 'General' },
  tags: { type: [String], default: [] },
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [String], default: [] }, // Track who voted
  views: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
