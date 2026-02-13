const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    appliedJobs: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['applied', 'interviewing', 'offered', 'rejected'],
            default: 'applied'
        },
        notes: {
            type: String,
            default: ''
        }
    }],
    batch: {
        type: String, // e.g. "2024", "2025"
        default: null
    },
    alertPreferences: {
        roles: [String], // e.g. ['SDE', 'Frontend']
        locations: [String], // e.g. ['Bangalore','Remote']
        minSalary: Number
    },
    degree: String, // e.g. 'B.Tech'
    graduationYear: Number, // e.g. 2025
    resumeScans: {
        count: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now }
    },

    // Grid Coins System
    gridCoins: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCount: { type: Number, default: 0 },
    
    // Login Streak (7-day streak = 10 coins)
    loginStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    lastVisit: { type: Date, default: Date.now }, // Track daily visits
    
    // Weekly Share Limit (max 20 coins/week from shares)
    weeklyShares: { type: Number, default: 0 },
    weeklySharesReset: { type: Date, default: Date.now },

    // Advanced Gamification
    badges: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    portfolioUrl: { type: String },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Diamond'], default: 'Bronze' },
    isBanned: { type: Boolean, default: false },
    profileRewardsClaimed: { type: [String], default: [] }, // e.g. ['skills', 'portfolio']
    
    // Activity Logging for Heatmap & Analytics
    // Activity Logging for Heatmap & Analytics
    activityLogs: [{
        action: { type: String, required: true }, // e.g. 'apply_click', 'save_click'
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        metadata: { type: Object },
        timestamp: { type: Date, default: Date.now }
    }],
    
    // Resume Score History
    resumeCheckHistory: [{
        score: { type: Number },
        feedback: { type: String },
        date: { type: Date, default: Date.now }
    }],
    
    // Push Notifications
    fcmTokens: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
