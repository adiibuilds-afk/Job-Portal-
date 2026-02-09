const mongoose = require('mongoose');

const AIUsageSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD format
        required: true,
        unique: true
    },
    tokensUsed: {
        type: Number,
        default: 0
    },
    requestCount: {
        type: Number,
        default: 0
    },
    breakdown: {
        seoGeneration: { type: Number, default: 0 },
        resumeScoring: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    errorCount: {
        type: Number,
        default: 0
    },
    rateLimitHits: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Static method to log usage
AIUsageSchema.statics.logUsage = async function(tokens, type = 'other') {
    const today = new Date().toISOString().split('T')[0];
    
    const update = {
        $inc: {
            tokensUsed: tokens,
            requestCount: 1,
            [`breakdown.${type}`]: tokens
        }
    };
    
    return this.findOneAndUpdate(
        { date: today },
        update,
        { upsert: true, new: true }
    );
};

// Static method to log errors
AIUsageSchema.statics.logError = async function(isRateLimit = false) {
    const today = new Date().toISOString().split('T')[0];
    
    const update = {
        $inc: {
            errorCount: 1,
            ...(isRateLimit ? { rateLimitHits: 1 } : {})
        }
    };
    
    return this.findOneAndUpdate(
        { date: today },
        update,
        { upsert: true, new: true }
    );
};

module.exports = mongoose.model('AIUsage', AIUsageSchema);
