const buttons = require("../services/buttons");

async function handleHome(ctx) {
  const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nYour Current balance is 0.00.`;
  await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
}

module.exports = (bot) => {
  bot.start(handleHome);
};

module.exports.handleHome = handleHome;
