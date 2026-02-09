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
    apiKeys: {
        apiKey1: { tokens: { type: Number, default: 0 }, requests: { type: Number, default: 0 } },
        apiKey2: { tokens: { type: Number, default: 0 }, requests: { type: Number, default: 0 } },
        apiKey3: { tokens: { type: Number, default: 0 }, requests: { type: Number, default: 0 } },
        apiKey4: { tokens: { type: Number, default: 0 }, requests: { type: Number, default: 0 } }
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
AIUsageSchema.statics.logUsage = async function(tokens, type = 'other', keyIndex = 0) {
    const today = new Date().toISOString().split('T')[0];
    const keyField = `apiKey${(keyIndex % 4) + 1}`;
    
    const update = {
        $inc: {
            tokensUsed: tokens,
            requestCount: 1,
            [`breakdown.${type}`]: tokens,
            [`apiKeys.${keyField}.tokens`]: tokens,
            [`apiKeys.${keyField}.requests`]: 1
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
