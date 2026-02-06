const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        unique: true
    },
    metrics: {
        registrations: { type: Number, default: 0 },
        logins: { type: Number, default: 0 }, // Unique logins (DAU)
        jobClicks: { type: Number, default: 0 },
        resumeScans: { type: Number, default: 0 },
        applyClicks: { type: Number, default: 0 },
        coinsEarned: { type: Number, default: 0 },
        coinsRedeemed: { type: Number, default: 0 }
    },
    activeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Track unique users for DAU
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
