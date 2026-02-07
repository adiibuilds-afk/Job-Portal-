const mongoose = require('mongoose');

const scheduledJobSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  priority: {
    type: Number,
    default: 0, // Higher = more priority
    min: 0,
    max: 10
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  error: {
    type: String,
  },
  // RG Jobs specific fields
  source: {
    type: String,
    enum: ['default', 'rgjobs', 'telegram_jobs', 'manual'],
    default: 'default'
  },
  rgJobData: {
    type: String, // JSON string of full RG job data
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ScheduledJob', scheduledJobSchema);
