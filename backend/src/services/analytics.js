const Analytics = require('../models/Analytics');

const trackEvent = async (metricName) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: { [`metrics.${metricName}`]: 1 } },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Analytics Tracking Error [${metricName}]:`, error);
    }
};

module.exports = { trackEvent };
