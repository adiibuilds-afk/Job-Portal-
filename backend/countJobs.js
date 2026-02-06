const mongoose = require('mongoose');
const Job = require('./src/models/Job');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Job.countDocuments({ 
            createdAt: { $gt: new Date(Date.now() - 20 * 60 * 1000) } 
        });
        console.log('Jobs imported in last 20 mins:', count);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
})();
