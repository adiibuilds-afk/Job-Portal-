const admin = require('firebase-admin');

// Initialize Firebase Admin (requires serviceAccount.json which user must provide)
try {
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.warn('Firebase Admin could not be initialized. Service account file might be missing.');
}

const sendNotification = async (tokens, title, body, data = {}) => {
    if (!tokens || tokens.length === 0) return;

    const message = {
        notification: {
            title,
            body
        },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK' // Use consistent keys
        },
        tokens: tokens.filter(t => t && t.length > 0)
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} notifications`);
        return response;
    } catch (error) {
        console.error('Error sending multicast message:', error);
        throw error;
    }
};

/**
 * Intelligent Job Notifications
 * Targeted by batch, internships, or dream companies.
 */
const triggerJobNotifications = async (job) => {
    try {
        const User = require('../models/User'); // Lazy load
        
        // 1. Find users who match the job batch
        const batchQuery = job.batch && job.batch.length > 0 ? { batch: { $in: job.batch } } : {};
        
        // 2. Find users who have this company as a dream company
        // For now, we'll notify users whose batch matches
        
        const users = await User.find({
            ...batchQuery,
            fcmTokens: { $exists: true, $not: { $size: 0 } }
        });

        let allTokens = [];
        users.forEach(user => {
            allTokens = [...allTokens, ...user.fcmTokens];
        });

        const uniqueTokens = [...new Set(allTokens)];

        if (uniqueTokens.length > 0) {
            const title = `🚀 New Opening: ${job.company}`;
            const body = `${job.title} - Batch ${job.batch.join(', ')} | Apply Now!`;
            const data = {
                url: `https://jobgrid.in/job/${job.slug}`
            };

            await sendNotification(uniqueTokens, title, body, data);
        }
    } catch (error) {
        console.error('Trigger Job Notifications Error:', error);
    }
};

module.exports = {
    sendNotification,
    triggerJobNotifications
};
