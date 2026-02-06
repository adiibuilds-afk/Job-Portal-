const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be boolean, string, number
        required: true
    },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
