const buttons = require('../services/buttons');

async function handleHome(ctx) {
  const welcomeMessage = `🤖 Welcome to Interactive Bot!\n\nHi ${ctx.from.first_name}! I'm your interactive Telegram bot.\n\n🔹 I can send you images\n🔹 I can show interactive buttons\n🔹 I can respond to your choices\n🔹 I can send you different types of content\n\nTry these commands:\n/help - Show all available commands\n/demo - See a demo with images and buttons\n/gallery - Browse image gallery\n/menu - Interactive menu with options\n/contact - Contact information`;
  await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
}

module.exports = (bot) => {
  bot.start(handleHome);
};

module.exports.handleHome = handleHome;
