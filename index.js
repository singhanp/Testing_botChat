require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Dual-Bot System: Bot A (Login) + Bot B (Multi-Agent Features)');
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