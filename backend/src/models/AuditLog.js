const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['user', 'job', 'cron', 'system', 'forum', 'settings'],
        default: 'system'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    targetType: {
        type: String,
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    adminId: {
        type: String,
        default: 'system'
    },
    adminName: {
        type: String,
        default: 'System'
    },
    ipAddress: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });

// Static method to log an action
AuditLogSchema.statics.log = async function(action, category, details = {}, adminInfo = {}) {
    return this.create({
        action,
        category,
        details,
        targetId: details.targetId || null,
        targetType: details.targetType || null,
        adminId: adminInfo.id || 'system',
        adminName: adminInfo.name || 'System',
        ipAddress: adminInfo.ip || null
    });
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);
