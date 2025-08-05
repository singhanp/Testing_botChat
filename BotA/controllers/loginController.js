const buttons = require('../services/buttons');
const BotHelper = require('../services/botHelper');
const loginForm = require('../services/loginForm');
const registerForm = require('../services/registerForm');

module.exports = (botA, botB) => {
  const botHelper = new BotHelper(botA, botB);
  // Bot A: Simple welcome and login
  botA.start(async (ctx) => {
    const welcomeMessage = `- Welcome to UG Telegram Bot System`;
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Login to Main Bot', callback_data: 'login_to_bot_b' }
          ],
          [
            { text: 'Register New Bot', callback_data: 'register_bot' }
          ],
          [
            { text: 'Help', callback_data: 'help_bot_a' }
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
    
    // Check if user has active login session
    if (loginForm.hasActiveSession(userId)) {
      const result = await loginForm.handleLoginInput(ctx);
      
      // If login successful, proceed to Bot B
      if (result && result.success) {
        try {
          const firstName = ctx.from.first_name;
          
          // Try to automatically start Bot B for the user
          const autoStarted = await botHelper.autoStartBotB(userId, firstName);
          
          // Send a message with a direct link to Bot B
          const loginMessage = autoStarted 
            ? '🔐 Login successful! You have been automatically logged in to the main bot. Click below to access all features:'
            : '🔐 Login successful! Click the button below to access the main bot with all features:';
            
          await ctx.reply(loginMessage, {
            reply_markup: {
              inline_keyboard: [
                [
                  { 
                    text: 'Go to Main Bot (Bot B)', 
                    url: botHelper.getBotBLoginUrl()
                  }
                ],
                [
                  { text: 'What\'s Available?', callback_data: 'show_features' }
                ]
              ]
            }
          });
        } catch (err) {
          console.error('Failed to redirect to Bot B:', err);
          await ctx.reply('❌ Failed to redirect to main bot. Please try again.');
        }
      }
      return; // Don't process other text handlers
    }
    
    // Handle greetings if not in login session
    const text = ctx.message.text.toLowerCase();
    if (/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i.test(text)) {
      const responseMessage = `👋 Hello ${ctx.from.first_name}! Welcome to the login bot.\n\nClick "Login" below to access all the main features!`;
      
      await ctx.reply(responseMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Login to Main Bot', callback_data: 'login_to_bot_b' }
            ],
            [
              { text: 'Register New Bot', callback_data: 'register_bot' }
            ]
          ]
        }
      });
    } else {
      // Default response for other text
      await ctx.reply('🔐 Welcome! Use the buttons below or type /start to begin.', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Login to Main Bot', callback_data: 'login_to_bot_b' }
            ],
            [
              { text: 'Register New Bot', callback_data: 'register_bot' }
            ],
            [
              { text: 'Help', callback_data: 'help_bot_a' }
            ]
          ]
        }
      });
    }
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
          // Start the login form process
          await loginForm.startLoginForm(ctx);
        } catch (err) {
          console.error('Failed to start login form:', err);
          await ctx.reply('❌ Login form failed to start. Please try again.');
        }
        break;
        
      case 'cancel_login':
        const userId = ctx.from.id;
        loginForm.cancelLogin(userId);
        await ctx.reply('❌ Login cancelled. You can try again anytime.', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
              ]
            ]
          }
        });
        break;
        
      case 'register_bot':
        try {
          // Start the registration form process
          await registerForm.startRegisterForm(ctx);
        } catch (err) {
          console.error('Failed to start registration form:', err);
          await ctx.reply('❌ Registration form failed to start. Please try again.');
        }
        break;
        
      case 'cancel_register':
        const registerUserId = ctx.from.id;
        registerForm.cancelRegister(registerUserId);
        await ctx.reply('❌ Registration cancelled. You can try again anytime.', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Login to Main Bot', callback_data: 'login_to_bot_b' }
              ],
              [
                { text: 'Register New Bot', callback_data: 'register_bot' }
              ]
            ]
          }
        });
        break;
        
      case 'back_to_main':
        const welcomeMessage = `- Welcome to UG Telegram Bot System`;
        
        await ctx.reply(welcomeMessage, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔐 Login to Main Bot', callback_data: 'login_to_bot_b' }
              ],
              [
                { text: '📝 Register New Bot', callback_data: 'register_bot' }
              ],
              [
                { text: '❓ Help', callback_data: 'help_bot_a' }
              ]
            ]
          }
        });
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