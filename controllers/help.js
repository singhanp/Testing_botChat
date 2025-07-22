const buttons = require('../services/buttons');

async function handleHelp(ctx) {
  const helpMessage = `📚 Available Commands:\n\n🔸 /start - Welcome message with options\n🔸 /demo - Interactive demo with images and buttons\n🔸 /gallery - Browse beautiful images\n🔸 /menu - Show interactive menu\n🔸 /contact - Get contact information\n🔸 /weather - Weather information (demo)\n🔸 /quote - Get an inspirational quote\n🔸 /games - Fun games menu\n🔸 /settings - Bot settings\n\n💡 You can also click on the buttons below for quick access!`;
  await ctx.reply(helpMessage, { reply_markup: buttons.helpKeyboard() });
}

module.exports = (bot) => {
  bot.help(handleHelp);
};

module.exports.handleHelp = handleHelp;
