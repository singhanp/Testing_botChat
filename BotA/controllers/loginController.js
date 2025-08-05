const buttons = require('../services/buttons');
const BotHelper = require('../services/botHelper');
const loginForm = require('../services/loginForm');
const registerForm = require('../services/registerForm');

module.exports = (botA, botB) => {
  const botHelper = new BotHelper(botA, botB);
  // Bot A: Simple welcome and login
  botA.start(async (ctx) => {
    const welcomeMessage = `Welcome to UG Telegram Bot System`;
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Apply Telegram Bot', callback_data: 'register_bot' }
          ]
        ]
      }
    });
  });

  // Handle login and registration form inputs
  botA.on('text', async (ctx) => {
    const userId = ctx.from.id;
    
    // Check if user has active registration session
    if (registerForm.hasActiveSession(userId)) {
      const result = await registerForm.handleRegisterInput(ctx);
      
      // If registration successful, show success message
      if (result && result.success) {
        // Registration completed successfully
        console.log(`✅ Registration completed for user ${userId}`);
      }
      return; // Don't process other text handlers
    }
    
    
    // Handle greetings if not in login session
    const text = ctx.message.text.toLowerCase();
    if (/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i.test(text)) {
      const responseMessage = `Hello ${ctx.from.first_name}! Welcome to UG Telegram Bot System.`;
      
      await ctx.reply(responseMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Apply Telegram Bot', callback_data: 'register_bot' }
            ]
          ]
        }
      });
    } else {
      // Default response for other text
      await ctx.reply('Welcome! Use the button below or type /start to begin.', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Apply Telegram Bot', callback_data: 'register_bot' }
            ]
          ]
        }
      });
    }
  });


  // Callback query handler for Bot A
  botA.on('callback_query', async (ctx) => {
    const action = ctx.callbackQuery.data;
    
    switch (action) {
      case 'register_bot':
        try {
          // Start the registration form process
          await registerForm.startRegisterForm(ctx);
        } catch (err) {
          console.error('Failed to start registration form:', err);
          await ctx.reply('Registration form failed to start. Please try again.');
        }
        break;
        
      case 'cancel_register':
        const registerUserId = ctx.from.id;
        registerForm.cancelRegister(registerUserId);
        await ctx.reply('Registration cancelled. You can try again anytime.', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Apply Telegram Bot', callback_data: 'register_bot' }
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