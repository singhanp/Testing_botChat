const buttons = require('../services/buttons');
const home = require('./home');
const game = require('./game');
const userTrackingService = require('../services/userTrackingService');
const authenticationService = require('../services/authenticationService');

module.exports = (bot, scheduler, dynamicBotManager = null) => {
  
  // Authentication input handler
  async function handleAuthenticationInput(ctx, session) {
    const userId = ctx.from.id;
    const input = ctx.message.text.trim();
    
    if (session.step === 'contact_input') {
      // User is entering email or phone
      let contactType, isValid;
      
      if (authenticationService.isValidEmail(input)) {
        contactType = 'email';
        isValid = true;
      } else if (authenticationService.isValidPhone(input)) {
        contactType = 'phone';
        isValid = true;
      } else {
        await ctx.reply('Invalid format. Please enter a valid email address or phone number:');
        return;
      }
      
      if (contactType === 'email') {
        authenticationService.setUserContact(userId, input, 'email');
        const otp = authenticationService.generateOTP(userId);
        await authenticationService.sendOTP(input, 'email', otp);
        
        const otpMessage = `Email Verification\n\nSend OTP to email (under construction)\n\nContact: ${input}\n\nFor now, use default OTP: 8888888\n\nPlease enter the OTP code:`;
        await ctx.reply(otpMessage);
        
      } else if (contactType === 'phone') {
        const formattedPhone = authenticationService.formatPhone(input);
        authenticationService.setUserContact(userId, formattedPhone, 'phone');
        const otp = authenticationService.generateOTP(userId);
        await authenticationService.sendOTP(formattedPhone, 'phone', otp);
        
        const otpMessage = `Phone Verification\n\nSend OTP to phone (under construction)\n\nContact: ${formattedPhone}\n\nFor now, use default OTP: 8888888\n\nPlease enter the OTP code:`;
        await ctx.reply(otpMessage);
      }
      
    } else if (session.step === 'otp_verification') {
      // User is entering OTP
      const result = authenticationService.verifyOTP(userId, input);
      
      if (result.success) {
        const actionType = session.authType === 'register' ? 'Registration' : 'Login';
        const successMessage = `${actionType} Successful!\n\nWelcome ${ctx.from.first_name}! Your ${session.contactType} has been verified.\n\nYou can now access all bot features.`;
        
        await ctx.reply(successMessage, { 
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Continue to Main Menu', callback_data: 'auth_complete' }]
            ]
          }
        });
      } else {
        let errorMessage = `Verification Failed\n\n`;
        
        if (result.error === 'Invalid OTP') {
          errorMessage += `The OTP you entered is incorrect.\n\n`;
          if (result.attemptsLeft > 0) {
            errorMessage += `You have ${result.attemptsLeft} attempt(s) remaining.\n\n`;
            errorMessage += `Reminder: Default OTP is 8888888\n\nPlease try again:`;
          } else {
            errorMessage += `Maximum attempts exceeded. Please start over with /start`;
          }
        } else if (result.error === 'OTP expired') {
          errorMessage += `Your OTP has expired. Please start over with /start`;
        } else {
          errorMessage += `${result.error}. Please start over with /start`;
        }
        
        await ctx.reply(errorMessage);
      }
    }
  }
  
  // Authentication callback handler
  async function handleAuthenticationCallback(ctx, action) {
    const userId = ctx.from.id;
    
    switch (action) {
      case 'auth_login':
        authenticationService.startAuthentication(userId, ctx.from, 'login');
        const loginMessage = `Login\n\nPlease enter your email or phone number for verification:`;
        await ctx.editMessageText(loginMessage);
        break;
        
      case 'auth_register':
        authenticationService.startAuthentication(userId, ctx.from, 'register');
        const registerMessage = `Register\n\nPlease enter your email or phone number for verification:`;
        await ctx.editMessageText(registerMessage);
        break;
        
      case 'auth_complete':
        const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        await ctx.editMessageText(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
        break;
        
      case 'restart_auth':
        const authMessage = `Welcome to Our Bot!\n\nHello ${ctx.from.first_name}! Please choose an option to continue:`;
        await ctx.editMessageText(authMessage, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Login', callback_data: 'auth_login' },
                { text: 'Register', callback_data: 'auth_register' }
              ]
            ]
          }
        });
        break;
    }
    
    await ctx.answerCbQuery();
  }
  
  // Logout handler
  async function handleLogout(ctx) {
    const userId = ctx.from.id;
    const sessionInfo = authenticationService.getUserSessionInfo(userId);
    
    if (sessionInfo) {
      const logoutMessage = `Logout Confirmation\n\n` +
        `Account Type: ${sessionInfo.authType === 'register' ? 'Registered' : 'Login'}\n` +
        `Contact: ${sessionInfo.contactInfo}\n` +
        `\nAre you sure you want to logout?`;
      
      await ctx.editMessageText(logoutMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Yes, Logout', callback_data: 'confirm_logout' },
              { text: 'Cancel', callback_data: 'cancel_logout' }
            ]
          ]
        }
      });
    } else {
      await ctx.reply('You are not currently logged in.');
    }
  }
  
  // Logout confirmation handler
  async function handleLogoutConfirmation(ctx) {
    const userId = ctx.from.id;
    const success = authenticationService.logout(userId);
    
    if (success) {
      const logoutSuccessMessage = `Logout Successful\n\n` +
        `You have been logged out successfully.\n\n` +
        `Thank you for using our bot!\n\n` +
        `To login again, use /start`;
      
      await ctx.editMessageText(logoutSuccessMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Login Again', callback_data: 'restart_auth' }
            ]
          ]
        }
      });
    } else {
      await ctx.editMessageText('Logout failed. You may not be logged in.');
    }
  }
  
  // Logout cancel handler
  async function handleLogoutCancel(ctx) {
    const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
    await ctx.editMessageText(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
  }
  
  // Start command - with authentication flow
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const botUsername = ctx.botInfo?.username || 'unknown_bot';
    const startPayload = ctx.message?.text?.split(' ')[1];
    
    // Track start command interaction
    userTrackingService.logStartInteraction(userId, botUsername, startPayload, ctx);
    
    // Check if user is already authenticated
    if (authenticationService.isAuthenticated(userId)) {
      const welcomeMessage = `Welcome back ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
      await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
      return;
    }
    
    const authMessage = `Welcome to Our Bot!\n\nHello ${ctx.from.first_name}! Please choose an option to continue:`;

    await ctx.reply(authMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Login', callback_data: 'auth_login' },
            { text: 'Register', callback_data: 'auth_register' }
          ]
        ]
      }
    });
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
    
    // Handle authentication flow
    const session = authenticationService.getUserSession(userId);
    if (session && !session.isVerified) {
      await handleAuthenticationInput(ctx, session);
      return;
    }
    
    // Check if user is authenticated before showing main menu
    if (!authenticationService.isAuthenticated(userId)) {
      const authMessage = `Please complete verification first by using /start`;
      await ctx.reply(authMessage);
      return;
    }
    
    // Show welcome message for authenticated users
    const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
    await ctx.reply(welcomeMessage, { reply_markup: buttons.welcomeKeyboard() });
  });

  // Respond to greetings
  bot.hears(/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i, async (ctx) => {
    const userId = ctx.from.id;
    
    // Check if user is authenticated
    if (!authenticationService.isAuthenticated(userId)) {
      const authMessage = `Hello ${ctx.from.first_name}! Please complete verification first by using /start`;
      await ctx.reply(authMessage);
      return;
    }
    
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
    
    // Handle authentication callbacks first
    if (action.startsWith('auth_')) {
      await handleAuthenticationCallback(ctx, action);
      return;
    }
    
    // Check if user is authenticated for other actions
    if (!authenticationService.isAuthenticated(userId)) {
      await ctx.answerCbQuery('Please complete verification first!');
      await ctx.editMessageText('Please complete verification by using /start');
      return;
    }
    
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
        await handleLogout(ctx);
        break;
      case 'confirm_logout':
        await handleLogoutConfirmation(ctx);
        break;
      case 'cancel_logout':
        await handleLogoutCancel(ctx);
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
    ctx.reply('An error occurred. Please try again or contact support.');
  });
}; 