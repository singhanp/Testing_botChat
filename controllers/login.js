async function handleLogin(ctx) {
    const loginMessage =  `Here you login`;
    await ctx.reply(loginMessage);
}

module.exports = (bot) => {
    bot.help(handleLogin);
};
  
module.exports.handleLogin = handleLogin;