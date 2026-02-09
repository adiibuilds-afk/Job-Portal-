const Analytics = require('../models/Analytics');

const trackEvent = async (metricName, userId = null) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const update = { $inc: { [`metrics.${metricName}`]: 1 } };
        if (userId) {
            update.$addToSet = { activeUsers: userId };
        }
        
        await Analytics.findOneAndUpdate(
            { date: today },
            update,
            { upsert: true }
        );
    } catch (error) {
        console.error(`Analytics Tracking Error [${metricName}]:`, error);
    }
};

const trackUserActivity = async (userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        await Analytics.findOneAndUpdate(
            { date: today },
            { 
                $inc: { 'metrics.logins': 1 },
                $addToSet: { activeUsers: userId } 
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Analytics User Activity Error:', error);
    }
};

module.exports = { trackEvent, trackUserActivity };
