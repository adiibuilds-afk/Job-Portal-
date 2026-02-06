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
    graduationYear: Number // e.g. 2025
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
