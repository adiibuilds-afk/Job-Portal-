const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const setupBot = require('./bot');
const { initScheduler } = require('./services/scheduler');
const { startWorker } = require('./services/resumeQueueWorker');
const apiRoutes = require('./routes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://jobgrid.in', 'https://www.jobgrid.in', 'http://localhost:3000', 'https://jobgrid-in.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Database Connection
connectDB();

// Initialize Services
let botInstance = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  botInstance = setupBot(process.env.TELEGRAM_BOT_TOKEN);
  initScheduler(botInstance);
  app.set('bot', botInstance);
  console.log('🤖 Bot initialized');
}

startWorker();

// Mount Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
