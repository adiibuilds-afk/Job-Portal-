const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout faster if no connection
        });
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Do not process.exit(1) causing crash loop on transient errors
        // Instead, maybe retry or just log it
        setTimeout(connectDB, 5000); // Retry after 5 seconds
    }
};

module.exports = connectDB;
