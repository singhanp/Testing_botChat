const { ADMIN_ID } = require('../services/auth');
const buttons = require('../services/buttons');
const help = require('./help');
const gallery = require('./gallery');
const demo = require('./demo');
const home = require('./home');
const menu = require('./menu');
const login = require('./login');

module.exports = (bot, scheduler, botB = null) => {
  // Store user data temporarily (if needed)
  const userData = {};

  // Start command
  bot.start(async (ctx) => {
    const welcomeMessage = `🤖 Welcome to Interactive Bot!\n\nHi ${ctx.from.first_name}! I'm your interactive Telegram bot.\n\n🔹 I can send you images\n🔹 I can show interactive buttons\n🔹 I can respond to your choices\n🔹 I can send you different types of content\n\nTry these commands:\n/help - Show all available commands\n/demo - See a demo with images and buttons\n/gallery - Browse image gallery\n/menu - Interactive menu with options\n/contact - Contact information`;
    await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
    // If botB is provided, try to send a message from botB as well
    if (botB) {
      try {
        await botB.telegram.sendMessage(ctx.from.id, '👋 Hello from Bot B! (You must have started Bot B before to receive this message.)');
      } catch (err) {
        console.error('Failed to send message from Bot B:', err);
      }
    }
  });

  // Respond to greetings with the same logic as /start
  bot.hears(/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i, async (ctx) => {
    const welcomeMessage = `🤖 Welcome to Interactive Bot!\n\nHi ${ctx.from.first_name}! I'm your interactive Telegram bot.\n\n🔹 I can send you images\n🔹 I can show interactive buttons\n🔹 I can respond to your choices\n🔹 I can send you different types of content\n\nTry these commands:\n/help - Show all available commands\n/demo - See a demo with images and buttons\n/gallery - Browse image gallery\n/menu - Interactive menu with options\n/contact - Contact information`;
    await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
  });

  // Register separated controllers
  help(bot);
  gallery(bot);
  demo(bot);
  menu(bot);

  // Good morning message commands
  bot.command('goodmorning', async (ctx) => {
    const chatId = ctx.chat.id;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name || '';
    
    const isEnabled = await scheduler.isGoodMorningEnabled(chatId);
    
    if (isEnabled) {
      await ctx.reply('🌅 You are already subscribed to good morning messages!\n\nUse /stopgoodmorning to unsubscribe.');
    } else {
      await scheduler.enableGoodMorning(chatId, firstName, lastName);
      await ctx.reply('✅ Good morning messages enabled!\n\n🌞 You will receive a daily good morning message at 8:00 AM UTC.\n\nUse /stopgoodmorning to unsubscribe anytime.');
    }
  });

  bot.command('stopgoodmorning', async (ctx) => {
    const chatId = ctx.chat.id;
    
    const isEnabled = await scheduler.isGoodMorningEnabled(chatId);
    
    if (!isEnabled) {
      await ctx.reply('❌ You are not subscribed to good morning messages.\n\nUse /goodmorning to subscribe.');
    } else {
      await scheduler.disableGoodMorning(chatId);
      await ctx.reply('🛑 Good morning messages disabled.\n\nYou will no longer receive daily good morning messages.\n\nUse /goodmorning to subscribe again anytime.');
    }
  });

  bot.command('goodmorningstatus', async (ctx) => {
    const chatId = ctx.chat.id;
    const isEnabled = await scheduler.isGoodMorningEnabled(chatId);
    
    if (isEnabled) {
      await ctx.reply('✅ Good morning messages: ENABLED\n\n🌅 You will receive daily good morning messages at 8:00 AM UTC.\n\nUse /stopgoodmorning to unsubscribe.');
    } else {
      await ctx.reply('❌ Good morning messages: DISABLED\n\nUse /goodmorning to subscribe to good morning messages.');
    }
  });

  // Admin command to see good morning stats
  bot.command('goodmorningstats', async (ctx) => {
    if (ctx.from.id.toString() === ADMIN_ID) {
      const stats = await scheduler.getStats();
      await ctx.reply(`📊 Good Morning Statistics:\n\n👥 Total Users: ${stats.totalUsers}\n✅ Subscribed: ${stats.subscribedUsers}\n❌ Unsubscribed: ${stats.unsubscribedUsers}\n\n🕰️ Next message: 8:00 AM UTC daily`);
    } else {
      await ctx.reply('❌ This command is only available for administrators.');
    }
  });

  // Test command to send a sample good morning message (admin only)
  bot.command('testgoodmorning', async (ctx) => {
    if (ctx.from.id.toString() === ADMIN_ID) {
      await scheduler.sendGoodMorningMessages();
      await ctx.reply('🧪 Test good morning messages sent to all subscribed users!');
    } else {
      await ctx.reply('❌ This command is only available for administrators.');
    }
  });

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
      case 'login':
        await login.handleLogin(ctx);
        break;
      case 'show_menu':
        await menu.handleMenu(ctx);
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