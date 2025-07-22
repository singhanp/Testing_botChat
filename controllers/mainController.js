const { ADMIN_ID } = require('../services/auth');
const buttons = require('../services/buttons');

module.exports = (bot) => {
  // Store user data temporarily (if needed)
  const userData = {};

  // Start command
  bot.start(async (ctx) => {
    const welcomeMessage = `🤖 Welcome to Interactive Bot!\n\nHi ${ctx.from.first_name}! I'm your interactive Telegram bot.\n\n🔹 I can send you images\n🔹 I can show interactive buttons\n🔹 I can respond to your choices\n🔹 I can send you different types of content\n\nTry these commands:\n/help - Show all available commands\n/demo - See a demo with images and buttons\n/gallery - Browse image gallery\n/menu - Interactive menu with options\n/contact - Contact information`;
    await ctx.reply(welcomeMessage, buttons.welcomeKeyboard);
  });

  // Help command
  bot.help(async (ctx) => {
    const helpMessage = `📚 Available Commands:\n\n🔸 /start - Welcome message with options\n🔸 /demo - Interactive demo with images and buttons\n🔸 /gallery - Browse beautiful images\n🔸 /menu - Show interactive menu\n🔸 /contact - Get contact information\n🔸 /weather - Weather information (demo)\n🔸 /quote - Get an inspirational quote\n🔸 /games - Fun games menu\n🔸 /settings - Bot settings\n\n💡 You can also click on the buttons below for quick access!`;
    await ctx.reply(helpMessage, buttons.helpKeyboard);
  });

  // Demo command with image and buttons
  bot.command('demo', async (ctx) => {
    try {
      await ctx.replyWithPhoto(
        { url: 'https://picsum.photos/800/600?random=1' },
        {
          caption: `🌟 Interactive Demo\n\nThis is a sample image with interactive buttons below. \nClick on any button to see how the bot responds!\n\n📸 Image source: Lorem Picsum (random image)`,
          ...buttons.demoKeyboard
        }
      );
    } catch (error) {
      console.error('Error sending image:', error);
      await ctx.reply('Sorry, there was an error loading the image. Let me show you the demo without image:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👍 Like', callback_data: 'like_image' },
              { text: '💬 Comment', callback_data: 'comment_image' }
            ],
            [
              { text: '🔄 Try Again', callback_data: 'start_demo' }
            ]
          ]
        }
      });
    }
  });

  // ... (Repeat for all other commands, callback_query, and text handlers from bot.js)

  // Error handling
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('🚨 An error occurred. Please try again or contact support.');
  });
}; 