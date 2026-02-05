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
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ScheduledJob', scheduledJobSchema);
