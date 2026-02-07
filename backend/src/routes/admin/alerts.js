const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Settings = require('../../models/Settings');

router.post('/batch', async (req, res) => {
    try {
        const { batches, subject, message } = req.body;
        if (!batches || !Array.isArray(batches) || batches.length === 0 || !message || !subject) {
            return res.status(400).json({ error: 'Batches, Subject, and Message are required' });
        }
        const { sendBroadcastEmail } = require('../../services/email');
        const queryArr = batches.map(b => {
            if (b === 'older-2023') return { graduationYear: { $lt: 2023 } };
            if (b === 'greater-2029') return { graduationYear: { $gt: 2029 } };
            return { batch: b };
        });
        const users = await User.find({ $or: queryArr });
        const emails = users.map(u => u.email).filter(Boolean);
        if (emails.length === 0) return res.json({ success: true, count: 0, message: 'No users found' });
        await sendBroadcastEmail(emails, subject, message);
        res.json({ success: true, count: emails.length, message: 'Alerts sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/analytics/update', async (req, res) => {
    try {
        const { sentCount, opens, clicks } = req.body;
        const totalSentSetting = await Settings.findOne({ key: 'broadcast_total_sent' });
        const currentTotal = totalSentSetting?.value || 0;
        const newTotal = currentTotal + sentCount;
        const newOpenRate = opens ? ((opens / sentCount) * 100).toFixed(1) : null;
        const newCtr = clicks ? ((clicks / sentCount) * 100).toFixed(1) : null;
        await Settings.findOneAndUpdate({ key: 'broadcast_total_sent' }, { value: newTotal }, { upsert: true });
        if (newOpenRate) await Settings.findOneAndUpdate({ key: 'broadcast_open_rate' }, { value: parseFloat(newOpenRate) }, { upsert: true });
        if (newCtr) await Settings.findOneAndUpdate({ key: 'broadcast_ctr' }, { value: parseFloat(newCtr) }, { upsert: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update analytics' });
    }
});

module.exports = router;
