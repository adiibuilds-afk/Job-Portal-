const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
  authorEmail: { type: String },
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [String], default: [] }, // Track who voted
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
