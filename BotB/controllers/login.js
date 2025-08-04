const handleLogin = async (ctx) => {
  const botBUsername = process.env.BOT_B_USERNAME || 'YourMainBotUsername';
  const loginUrl = `https://t.me/${botBUsername}?start=from_login`;
  
  const loginMessage = `🔐 **Login to Main Bot**\n\n` +
    `Welcome! To access the full features of our multi-agent system, please click the button below to go to our main bot.\n\n` +
    `🎯 **What you'll get access to:**\n` +
    `• Role-based features (Super Admin, Agent, Member)\n` +
    `• Games and activities\n` +
    `• Image galleries\n` +
    `• Statistics and reporting\n` +
    `• Team management tools\n\n` +
    `👇 Click the button below to continue:`;

  await ctx.editMessageText(loginMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { 
            text: '🚀 Go to Main Bot', 
            url: loginUrl
          }
        ],
        [
          { 
            text: '🔙 Back to Menu', 
            callback_data: 'back_to_main' 
          }
        ]
      ]
    },
    parse_mode: 'Markdown'
  });
};

module.exports = { handleLogin };