const buttons = require('../services/buttons');

module.exports = (botA, botB) => {
  // Bot A: Simple welcome and login
  botA.start(async (ctx) => {
    const welcomeMessage = `🔐 Welcome to Login Bot!\n\nHi ${ctx.from.first_name}! This is Bot A - your entry point.\n\n🔹 Click "Login" to access the main features\n🔹 All games, galleries, and features are in Bot B\n🔹 You'll be redirected to the main bot after login\n\nReady to get started?`;
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
          ],
          [
            { text: '❓ Help', callback_data: 'help_bot_a' }
          ]
        ]
      }
    });
  });

  // Respond to greetings
  botA.hears(/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i, async (ctx) => {
    const responseMessage = `👋 Hello ${ctx.from.first_name}! Welcome to the login bot.\n\nClick "Login" below to access all the main features!`;
    
    await ctx.reply(responseMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
          ]
        ]
      }
    });
  });

  // Help command for Bot A
  botA.command('help', async (ctx) => {
    const helpMessage = `🔐 Bot A Help\n\nThis is the login bot. Here's what you can do:\n\n🔹 Click "Login" to access the main bot\n🔹 All features are in Bot B\n🔹 Games, galleries, and more await you!\n\nCommands:\n/start - Welcome message\n/help - This help message\n\nClick login to get started!`;
    
    await ctx.reply(helpMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
          ]
        ]
      }
    });
  });

  // Callback query handler for Bot A
  botA.on('callback_query', async (ctx) => {
    const action = ctx.callbackQuery.data;
    
    switch (action) {
      case 'login_to_bot_b':
        try {
          // Send a message with a direct link to Bot B
          await ctx.reply('🔐 Login successful! Click the button below to access the main bot with all features:', {
            reply_markup: {
              inline_keyboard: [
                [
                  { 
                    text: '🤖 Go to Main Bot (Bot B)', 
                    url: 'https://t.me/Hippo99bot?start=from_login' 
                  }
                ],
                [
                  { text: '📋 What\'s Available?', callback_data: 'show_features' }
                ]
              ]
            }
          });
        } catch (err) {
          console.error('Failed to send login message:', err);
          await ctx.reply('❌ Login failed. Please try again.');
        }
        break;
        
      case 'help_bot_a':
        await ctx.reply('🔐 Bot A Help\n\nThis is your entry point to the main bot system.\n\n🔹 Click "Login" to access Bot B\n🔹 Bot B has all the features:\n  • Multi-agent system\n  • Games and activities\n  • Image galleries\n  • Role-based access\n  • And much more!\n\nReady to explore?', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
              ]
            ]
          }
        });
        break;
        
      case 'show_features':
        await ctx.reply('🎮 Available Features in Bot B:\n\n👑 Super Admin Features:\n• Manage all agents\n• System statistics\n• Broadcast messages\n\n👨‍💼 Agent Features:\n• Manage team members\n• Agent statistics\n• Send messages to members\n\n🎮 Member Features:\n• Play games\n• Personal statistics\n• Browse galleries\n• Customize preferences\n\n👤 Guest Features:\n• Demo access\n• Gallery browsing\n• Contact agents\n\nClick login to access all these features!', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
              ]
            ]
          }
        });
        break;
        
      default:
        await ctx.answerCbQuery('Unknown action!');
    }
    
    // Always answer the callback to remove the loading state
    await ctx.answerCbQuery();
  });

  // Error handling for Bot A
  botA.catch((err, ctx) => {
    console.error('Bot A error:', err);
    ctx.reply('🚨 An error occurred. Please try again.');
  });
}; 