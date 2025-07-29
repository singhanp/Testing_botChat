require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Telegram Bot is Running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

const { botA, botB } = require('./services/telegram');
const mainController = require('./controllers/mainController');
const SchedulerService = require('./services/scheduler');

// Initialize scheduler for both bots (if needed, or just botA)
const schedulerA = new SchedulerService(botA);
const schedulerB = new SchedulerService(botB);

// Main controller for both bots
mainController(botA, schedulerA, botB);
mainController(botB, schedulerB);

Promise.all([
  botA.launch().then(() => console.log('🤖 Bot A started!')),
  botB.launch().then(() => console.log('🤖 Bot B started!'))
]).catch((err) => {
  console.error('❌ Failed to start bots:', err);
  process.exit(1);
});

process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bots...');
  botA.stop('SIGINT');
  botB.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bots...');
  botA.stop('SIGTERM');
  botB.stop('SIGTERM');
  process.exit(0);
}); 