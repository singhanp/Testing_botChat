require('dotenv').config();
const { Telegraf } = require('telegraf');
const botB = new Telegraf(process.env.BOT_B_TOKEN);

const SchedulerService = require('./services/scheduler');
const mainController = require('./controllers/mainController');

const schedulerB = new SchedulerService(botB);
mainController(botB, schedulerB);

botB.launch().then(() => {
  console.log('🤖 BotB (Main Features) started!');
});

process.once('SIGINT', () => botB.stop('SIGINT'));
process.once('SIGTERM', () => botB.stop('SIGTERM'));
