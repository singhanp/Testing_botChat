const buttons = require('../services/buttons');
const home = require('./home');
const game = require('./game');
const userTrackingService = require('../services/userTrackingService');

module.exports = (bot, scheduler, dynamicBotManager = null) => {
  // Start command - simple welcome for single user
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const botUsername = ctx.botInfo?.username || 'unknown_bot';
    const startPayload = ctx.message?.text?.split(' ')[1];
    
    // Track start command interaction
    userTrackingService.logStartInteraction(userId, botUsername, startPayload, ctx);
    
    const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
    await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
  });

  // Handle regular messages
  bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const botUsername = ctx.botInfo?.username || 'unknown_bot';
    
    // Track text message interaction
    if (ctx.message.text && !ctx.message.text.startsWith('/')) {
      userTrackingService.logTextInteraction(userId, botUsername, ctx.message.text, ctx);
    }
    
    // Skip if it's a command (handled by other handlers)
    if (ctx.message.text && ctx.message.text.startsWith('/')) {
      return;
    }
    
    // Show welcome message for any non-command message
    const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
    await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
  });

  // Respond to greetings
  bot.hears(/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i, async (ctx) => {
    const responseMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
    await ctx.reply(responseMessage, { reply_markup: buttons.welcomeKeyboard() });
  });



  // Callback query handler for buttons
  bot.on('callback_query', async (ctx) => {
    const action = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const botUsername = ctx.botInfo?.username || 'unknown_bot';
    
    // Track callback interaction
    userTrackingService.logCallbackInteraction(userId, botUsername, action, ctx);
    
    switch (action) {
      case 'game_menu':
        await game.handleGameCategoryMenu(ctx);
        break;
      case 'my_favourite':
        await game.handleMyFavourite(ctx);
        break;
      case 'popular_games':
        await game.handlePopularGames(ctx);
        break;
      case 'pragmatic_slot':
        await game.handleGameList(ctx, 1);
        break;
      case 'check_balance':
        await ctx.reply('Balance: $0.00\n\nThis is a dummy balance display. Your account balance will be shown here.');
        break;
      case 'deposit':
        await ctx.reply('Deposit\n\nThis is a dummy deposit function. Deposit functionality will be implemented here.');
        break;
      case 'withdraw':
        await ctx.reply('Withdraw\n\nThis is a dummy withdraw function. Withdrawal functionality will be implemented here.');
        break;
      case 'logout':
        await ctx.reply('Logout\n\nThis is a dummy logout function. Logout functionality will be implemented here.');
        break;
      case 'back_to_main':
        await home.handleHome(ctx);
        break;
      default:
        // Handle game list pagination
        if (action.startsWith('game_list_page_')) {
          const page = parseInt(action.replace('game_list_page_', ''));
          await game.handleGameList(ctx, page);
        } else if (action.startsWith('game_detail_')) {
          const gameId = action.replace('game_detail_', '');
          await game.handleGameDetail(ctx, gameId);
        } else if (action === 'page_info') {
          await ctx.answerCbQuery('Page information');
        } else {
          await ctx.answerCbQuery('Unknown action!');
        }
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