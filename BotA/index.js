require('dotenv').config();
const { Telegraf } = require('telegraf');
const { connectDB } = require('./config/database');

const botA = new Telegraf(process.env.BOT_A_TOKEN);

const loginController = require('./controllers/loginController');
const BotHelper = require('./services/botHelper');

// Connect to MongoDB
connectDB().then(() => {
  console.log('✅ BotA MongoDB connected');
}).catch(err => {
  console.error('❌ BotA MongoDB connection failed:', err);
});

// Initialize controllers
loginController(botA, null);

botA.launch().then(() => {
  console.log('🤖 BotA (Login & Register) started!');
});

process.once('SIGINT', () => {
  botA.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  botA.stop('SIGTERM');
  process.exit(0);
});
