require('dotenv').config();
const { Telegraf } = require('telegraf');
const botA = new Telegraf(process.env.BOT_A_TOKEN);

const loginController = require('./controllers/loginController');
const BotHelper = require('./services/botHelper');

// If BotA needs to connect to BotB, you can set up the helper here
loginController(botA, null);

botA.launch().then(() => {
  console.log('🤖 BotA (Login) started!');
});

process.once('SIGINT', () => botA.stop('SIGINT'));
process.once('SIGTERM', () => botA.stop('SIGTERM'));
