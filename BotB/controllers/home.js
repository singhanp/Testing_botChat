const buttons = require("../services/buttons");

async function handleHome(ctx) {
  const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
  await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
}

module.exports = (bot) => {
  bot.start(handleHome);
};

module.exports.handleHome = handleHome;
