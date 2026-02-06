const mongoose = require('mongoose');
const Job = require('./src/models/Job');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const res = await Job.deleteOne({ title: { $regex: 'Sumo Logic', $options: 'i' } });
        console.log('Deleted Count:', res.deletedCount);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
})();
