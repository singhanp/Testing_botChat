const fs = require('fs').promises;
const path = require('path');

class RegisterFormHandler {
  constructor() {
    this.registerSessions = new Map(); // Store temporary registration sessions
  }

  // Start registration process - request bot name
  async startRegisterForm(ctx) {
    const userId = ctx.from.id;
    
    // Initialize registration session
    this.registerSessions.set(userId, {
      step: 'bot_name',
      startTime: Date.now(),
      attempts: 0
    });

    const helpMessage = `🤖 Bot Registration Form

Please provide the following information:

📝 **Step 1: Bot Name**
Enter your bot's name (e.g., "MyAwesome Bot"):

💡 **Need help getting a bot token?**
If you don't have a bot token yet, click the link below to learn how to create one with BotFather:

🔗 [How to Create a Bot with BotFather](https://core.telegram.org/bots/tutorial#getting-ready)

Quick Steps:
1. Message @BotFather on Telegram
2. Send /newbot
3. Choose a name for your bot
4. Choose a username (must end in 'bot')
5. Copy the token BotFather gives you`;

    await ctx.reply(helpMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: '📖 BotFather Tutorial', 
              url: 'https://core.telegram.org/bots/tutorial#getting-ready' 
            }
          ],
          [
            { text: '❌ Cancel Registration', callback_data: 'cancel_register' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    });
  }

  // Handle user input during registration process
  async handleRegisterInput(ctx) {
    const userId = ctx.from.id;
    const session = this.registerSessions.get(userId);
    
    if (!session) {
      await ctx.reply('❌ No active registration session. Please start registration again.');
      return false;
    }

    // Check session timeout (10 minutes)
    if (Date.now() - session.startTime > 600000) {
      this.registerSessions.delete(userId);
      await ctx.reply('⏰ Registration session expired. Please try again.');
      return false;
    }

    const userInput = ctx.message.text.trim();

    switch (session.step) {
      case 'bot_name':
        return await this.handleBotNameInput(ctx, userInput, session);
      case 'access_token':
        return await this.handleAccessTokenInput(ctx, userInput, session);
      default:
        return false;
    }
  }

  // Handle bot name input
  async handleBotNameInput(ctx, botName, session) {
    const userId = ctx.from.id;

    // Validate bot name
    if (!botName || botName.length < 3 || botName.length > 50) {
      session.attempts++;
      if (session.attempts >= 3) {
        this.registerSessions.delete(userId);
        await ctx.reply('❌ Too many invalid attempts. Please start registration again.');
        return false;
      }
      await ctx.reply('❌ Bot name must be between 3-50 characters. Please try again:');
      return false;
    }

    // Store bot name and move to access token step
    session.botName = botName;
    session.step = 'access_token';
    session.attempts = 0;

    const tokenMessage = `✅ Bot name: "${botName}" received!

📝 **Step 2: Access Token**
Now please enter your bot's access token from BotFather.

The token looks like: \`123456789:ABCdefGHIjklMNOpqrsTUVwxyZ\`

⚠️ **Important:**
- Keep your token secret
- Don't share it publicly
- Each bot has a unique token

💡 **Don't have a token yet?**
1. Go to @BotFather on Telegram
2. Send /newbot
3. Follow the instructions
4. Copy the token BotFather gives you`;

    await ctx.reply(tokenMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: '📖 BotFather Tutorial', 
              url: 'https://core.telegram.org/bots/tutorial#getting-ready' 
            }
          ],
          [
            { text: '❌ Cancel Registration', callback_data: 'cancel_register' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    });

    return true;
  }

  // Handle access token input
  async handleAccessTokenInput(ctx, accessToken, session) {
    const userId = ctx.from.id;

    // Validate access token format
    if (!this.isValidBotToken(accessToken)) {
      session.attempts++;
      if (session.attempts >= 3) {
        this.registerSessions.delete(userId);
        await ctx.reply('❌ Too many invalid attempts. Please start registration again.');
        return false;
      }
      await ctx.reply('❌ Invalid token format. Bot tokens look like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyZ`\n\nPlease try again:', {
        parse_mode: 'Markdown'
      });
      return false;
    }

    // Store access token
    session.accessToken = accessToken;

    // Validate token by making a test API call
    const isValidToken = await this.validateBotToken(accessToken);
    
    if (isValidToken.valid) {
      // Save the registration
      const registrationData = {
        userId: userId,
        userName: ctx.from.first_name,
        botName: session.botName,
        accessToken: accessToken,
        botUsername: isValidToken.botInfo?.username || 'Unknown',
        registeredAt: new Date().toISOString()
      };

      await this.saveRegistration(registrationData);
      
      // Clear the session
      this.registerSessions.delete(userId);
      
      const successMessage = `🎉 **Registration Successful!**

✅ **Bot Details:**
📋 Name: ${session.botName}
🤖 Username: @${isValidToken.botInfo?.username || 'Unknown'}
🔑 Token: ${accessToken.substring(0, 10)}...

Your bot has been registered successfully! You can now use the login system.

**Next Steps:**
1. Use /start to access the main menu
2. Click "Login" to authenticate
3. Enjoy your bot features!`;

      await ctx.reply(successMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🏠 Back to Main Menu', callback_data: 'back_to_main' }
            ]
          ]
        },
        parse_mode: 'Markdown'
      });

      return { success: true, botInfo: isValidToken.botInfo };
    } else {
      session.attempts++;
      if (session.attempts >= 3) {
        this.registerSessions.delete(userId);
        await ctx.reply('❌ Too many failed attempts. Please start registration again.');
        return false;
      }
      await ctx.reply(`❌ Invalid or inactive bot token. Error: ${isValidToken.error}\n\nPlease check your token and try again:`);
      return false;
    }
  }

  // Validate bot token format
  isValidBotToken(token) {
    // Bot token format: number:letters/numbers/symbols
    const tokenRegex = /^\d{8,10}:[A-Za-z0-9_-]{35}$/;
    return tokenRegex.test(token);
  }

  // Validate bot token by making API call
  async validateBotToken(token) {
    try {
      const fetch = require('node-fetch');
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        return { valid: true, botInfo: data.result };
      } else {
        return { valid: false, error: data.description || 'Invalid token' };
      }
    } catch (error) {
      return { valid: false, error: 'Network error or invalid token' };
    }
  }

  // Save registration data
  async saveRegistration(registrationData) {
    try {
      const registrationsFilePath = path.join(__dirname, '../database/registrations.json');
      
      let registrations = [];
      try {
        const data = await fs.readFile(registrationsFilePath, 'utf8');
        registrations = JSON.parse(data);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Check if user already registered
      const existingIndex = registrations.findIndex(reg => reg.userId === registrationData.userId);
      
      if (existingIndex >= 0) {
        // Update existing registration
        registrations[existingIndex] = registrationData;
      } else {
        // Add new registration
        registrations.push(registrationData);
      }

      await fs.writeFile(registrationsFilePath, JSON.stringify(registrations, null, 2));
      
      console.log(`✅ Registration saved for user ${registrationData.userId}`);
    } catch (error) {
      console.error('Error saving registration:', error);
      throw error;
    }
  }

  // Cancel registration session
  cancelRegister(userId) {
    this.registerSessions.delete(userId);
  }

  // Check if user has active registration session
  hasActiveSession(userId) {
    return this.registerSessions.has(userId);
  }

  // Get session info
  getSession(userId) {
    return this.registerSessions.get(userId);
  }

  // Get user registration
  async getUserRegistration(userId) {
    try {
      const registrationsFilePath = path.join(__dirname, '../database/registrations.json');
      const data = await fs.readFile(registrationsFilePath, 'utf8');
      const registrations = JSON.parse(data);
      
      return registrations.find(reg => reg.userId === userId);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new RegisterFormHandler();