const { ADMIN_ID } = require('../services/auth');
const buttons = require('../services/buttons');
const help = require('./help');
const gallery = require('./gallery');
const demo = require('./demo');
const home = require('./home');

module.exports = (bot) => {
  // Store user data temporarily (if needed)
  const userData = {};

  // Start command (moved to home.js)
  home(bot, buttons);

  // Register separated controllers
  help(bot);
  gallery(bot);
  demo(bot);

  // Callback query handler for inline buttons
  bot.on('callback_query', async (ctx) => {
    const action = ctx.callbackQuery.data;
    switch (action) {
      case 'start_demo':
        await demo.handleDemo(ctx);
        break;
      case 'gallery':
        await gallery.handleGallery(ctx);
        break;
      case 'show_menu':
        await ctx.reply('📋 Here is the menu!');
        break;
      case 'help':
        await help.handleHelp(ctx);
        break;
      case 'like_image':
        await ctx.reply('👍 You liked the image!');
        break;
      case 'comment_image':
        await ctx.reply('💬 You want to comment!');
        break;
      case 'share_image':
        await ctx.reply('📤 You want to share!');
        break;
      case 'new_image':
        await ctx.reply('🔄 Here is a new image!');
        break;
      case 'image_stats':
        await ctx.reply('📊 Here are the image stats!');
        break;
      case 'games':
        await ctx.reply('🎮 Here are the games!');
        break;
      case 'settings':
        await ctx.reply('⚙️ Here are the settings!');
        break;
      case 'back_to_main':
        await home.handleHome(ctx);
        break;
      default:
        await ctx.answerCbQuery('Unknown action!');
    }
    // Always answer the callback to remove the loading state
    await ctx.answerCbQuery();
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('🚨 An error occurred. Please try again or contact support.');
  });
}; 