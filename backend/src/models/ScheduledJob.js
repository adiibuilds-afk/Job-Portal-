const mongoose = require('mongoose');

const scheduledJobSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
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
  error: {
    type: String,
  },
  // RG Jobs specific fields
  source: {
    type: String,
    enum: ['default', 'rgjobs', 'telegram_jobs'],
    default: 'default'
  },
  rgJobData: {
    type: String, // JSON string of full RG job data
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ScheduledJob', scheduledJobSchema);
