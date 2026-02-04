require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./src/models/Job');

async function clearJobs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        await Job.deleteMany({});
        console.log('All jobs deleted successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('Error clearing jobs:', error);
        process.exit(1);
    }
}

clearJobs();
