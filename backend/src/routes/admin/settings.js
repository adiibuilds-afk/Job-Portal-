const express = require('express');
const router = express.Router();
const Settings = require('../../models/Settings');

router.post('/maintenance/toggle', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'maintenance_mode' });
        const newValue = setting ? !setting.value : true;
        await Settings.findOneAndUpdate({ key: 'maintenance_mode' }, { value: newValue }, { upsert: true });
        res.json({ success: true, maintenanceMode: newValue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
});

router.get('/', async (req, res) => {
    try {
        const settings = await Settings.find();
        const settingsMap = {};
        settings.forEach(s => { settingsMap[s.key] = s.value; });
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
        res.json({ success: true, setting });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

router.get('/queue-interval', async (req, res) => {
    try {
        const intervalSetting = await Settings.findOne({ key: 'queue_interval_minutes' });
        res.json({ interval: intervalSetting?.value || 5 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch queue interval' });
    }
});

module.exports = router;
