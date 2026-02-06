const mongoose = require('mongoose');

const ResumeQueueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false
    },
    customJob: {
        title: String,
        company: String
    },
    resumeText: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    result: {
        type: Object, // JSON analysis from AI
        default: null
    },
    error: {
        type: String,
        default: null
    },
    processingStartedAt: Date,
    completedAt: Date
}, { timestamps: true });

// Index for finding pending jobs quickly
ResumeQueueSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('ResumeQueue', ResumeQueueSchema);
