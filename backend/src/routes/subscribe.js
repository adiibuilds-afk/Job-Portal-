const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// POST /api/subscribe - Subscribe to email notifications
router.post('/', async (req, res) => {
    try {
        const { email, batch } = req.body;

        if (!email || !batch) {
            return res.status(400).json({ message: 'Email and batch are required' });
        }

        // Check if already subscribed
        const existing = await Subscriber.findOne({ email: email.toLowerCase() });
        
        if (existing) {
            // Update batch if different
            if (existing.batch !== batch) {
                existing.batch = batch;
                existing.isActive = true;
                await existing.save();
                return res.status(200).json({ 
                    message: 'Subscription updated successfully!', 
                    subscriber: existing 
                });
            }
            return res.status(200).json({ 
                message: 'Already subscribed to this batch!', 
                subscriber: existing 
            });
        }

        // Create new subscription
        const subscriber = new Subscriber({
            email: email.toLowerCase(),
            batch
        });

        await subscriber.save();

        res.status(201).json({ 
            message: 'Successfully subscribed!', 
            subscriber 
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ message: 'Failed to subscribe', error: error.message });
    }
});

// POST /api/subscribe/unsubscribe - Unsubscribe from notifications
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

        if (!subscriber) {
            return res.status(404).json({ message: 'Email not found in subscriptions' });
        }

        subscriber.isActive = false;
        await subscriber.save();

        res.status(200).json({ message: 'Successfully unsubscribed' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ message: 'Failed to unsubscribe', error: error.message });
    }
});

// GET /api/subscribe/all - Get all active subscribers (admin only)
router.get('/all', async (req, res) => {
    try {
        const subscribers = await Subscriber.find({ isActive: true }).sort({ subscribedAt: -1 });
        res.status(200).json({ subscribers, count: subscribers.length });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ message: 'Failed to fetch subscribers', error: error.message });
    }
});

module.exports = router;
