const mongoose = require('mongoose');

const CronConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    schedule: {
        type: String, // Cron expression: '0 */2 * * *' = every 2 hours
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    lastRun: {
        type: Date,
        default: null
    },
    lastStatus: {
        type: String,
        enum: ['success', 'failed', 'running', 'never'],
        default: 'never'
    },
    lastError: {
        type: String,
        default: null
    },
    runCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('CronConfig', CronConfigSchema);
