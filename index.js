require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { connectDB, disconnectDB } = require('./config/database');

app.get('/', (req, res) => {
  res.send('🤖 Dual-Bot System: Bot A (Login) + Bot B (Multi-Agent Features)');
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

// Connect to MongoDB
connectDB().then(() => {
  console.log('📊 Database connection established');
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});

const { botA, botB } = require('./services/telegram');
const mainController = require('./controllers/mainController');
const SchedulerService = require('./services/scheduler');

// Initialize scheduler for Bot B (main features)
const schedulerB = new SchedulerService(botB);

// Bot A: Simple login/entry controller
const loginController = require('./controllers/loginController');

// Bot B: Full multi-agent controller
mainController(botB, schedulerB);

// Bot A: Login and redirect to Bot B
loginController(botA, botB);

Promise.all([
  botA.launch().then(() => console.log('🤖 Bot A (Login) started!')),
  botB.launch().then(() => console.log('🤖 Bot B (Multi-Agent Features) started!'))
]).catch((err) => {
  console.error('❌ Failed to start bots:', err);
  process.exit(1);
});

process.once('SIGINT', async () => {
  console.log('\n🛑 Stopping bots...');
  botA.stop('SIGINT');
  botB.stop('SIGINT');
  await disconnectDB();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  console.log('\n🛑 Stopping bots...');
  botA.stop('SIGTERM');
  botB.stop('SIGTERM');
  await disconnectDB();
  process.exit(0);
}); 