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

const bot = require('./services/telegram');
const mainController = require('./controllers/mainController');
const SchedulerService = require('./services/scheduler');

// Initialize scheduler
const scheduler = new SchedulerService(bot);

mainController(bot, scheduler);

bot.launch()
  .then(() => console.log('🤖 Bot started!'))
  .catch((err) => {
    console.error('❌ Failed to start bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop('SIGTERM');
  process.exit(0);
}); 