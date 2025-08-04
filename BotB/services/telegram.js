const { Telegraf } = require('telegraf');
const botA = new Telegraf(process.env.BOT_A_TOKEN);
const botB = new Telegraf(process.env.BOT_B_TOKEN);

module.exports = { botA, botB }; 