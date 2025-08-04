const mongoose = require('mongoose');
const botService = require('../services/botService');
const tokenValidator = require('../services/tokenValidator');

class Register {
  constructor() {
    // Initialize registration sessions
    this.registrationSessions = new Map();
  }

  /**
   * Start registration process
   * @param {Object} ctx - Telegram context
   * @returns {Promise<void>}
   */
  async startRegistration(ctx) {
    const userId = ctx.from.id;
    
    // Initialize registration session
    this.registrationSessions.set(userId, {
      step: 'waiting_for_email',
      data: {},
      startTime: Date.now()
    });
    
    await ctx.reply('🤖 Welcome to Bot Registration!\n\nPlease enter your email address:');
  }

  /**
   * Handle registration input
   * @param {Object} ctx - Telegram context
   * @returns {Promise<Object|null>} - Result object or null
   */
  async handleRegistrationInput(ctx) {
    const userId = ctx.from.id;
    const session = this.registrationSessions.get(userId);
    
    if (!session) return null;
    
    // Check session timeout (10 minutes)
    if (Date.now() - session.startTime > 600000) {
      this.registrationSessions.delete(userId);
      await ctx.reply('⏰ Registration session expired. Please try again.');
      return null;
    }
    
    const text = ctx.message.text;
    
    switch (session.step) {
      case 'waiting_for_email':
        return await this.handleEmailInput(ctx, text, session);
        
      case 'waiting_for_bot_name':
        return await this.handleBotNameInput(ctx, text, session);
        
      case 'waiting_for_token':
        return await this.handleTokenInput(ctx, text, session);
        
      default:
        return null;
    }
  }

  /**
   * Handle email input
   * @param {Object} ctx - Telegram context
   * @param {string} email - Email input
   * @param {Object} session - Registration session
   * @returns {Promise<Object|null>}
   */
  async handleEmailInput(ctx, email, session) {
    // Validate email format
    if (!this.isValidEmail(email)) {
      await ctx.reply('❌ Please enter a valid email address:');
      return null;
    }

    // Check if email is already registered
    const emailExists = await botService.isEmailRegistered(email);
    if (emailExists) {
      await ctx.reply('❌ This email is already registered. Please use a different email address:');
      return null;
    }

    // Save email and move to next step
    session.data.email = email.toLowerCase();
    session.step = 'waiting_for_bot_name';
    
    await ctx.reply('✅ Email is valid!\n\nNow please enter a name for your bot (3-32 characters):');
    return null;
  }

  /**
   * Handle bot name input
   * @param {Object} ctx - Telegram context
   * @param {string} botName - Bot name input
   * @param {Object} session - Registration session
   * @returns {Promise<Object|null>}
   */
  async handleBotNameInput(ctx, botName, session) {
    // Validate bot name
    if (!this.isValidBotName(botName)) {
      await ctx.reply('❌ Bot name must be between 3 and 32 characters and can only contain letters, numbers, spaces, and underscores. Please try again:');
      return null;
    }

    // Save bot name and move to next step
    session.data.botName = botName;
    session.step = 'waiting_for_token';
    
    const tokenGuide = `✅ Bot name "${botName}" is valid!\n\nNow I need your bot's access token.\n\n📋 **How to get your bot token:**\n\n1️⃣ Open Telegram and search for "@BotFather"\n2️⃣ Start a chat with BotFather\n3️⃣ Send /newbot command\n4️⃣ Follow the instructions to create your bot\n5️⃣ BotFather will give you a token like:\n   \`1234567890:ABCdefGHIjklMNOpqrsTUVwxyz\`\n\n6️⃣ Copy the token and paste it here\n\n⚠️ **Important:** Never share your token with anyone!\n\nPlease paste your bot token:`;
    
    await ctx.reply(tokenGuide, { parse_mode: 'Markdown' });
    return null;
  }

  /**
   * Handle token input
   * @param {Object} ctx - Telegram context
   * @param {string} token - Token input
   * @param {Object} session - Registration session
   * @returns {Promise<Object|null>}
   */
  async handleTokenInput(ctx, token, session) {
    // Validate token format
    if (!this.isValidTokenFormat(token)) {
      await ctx.reply('❌ Invalid token format. Please make sure you copied the complete token from BotFather and try again:');
      return null;
    }

    // Check if token already exists
    const tokenExists = await botService.isTokenExists(token);
    if (tokenExists) {
      await ctx.reply('❌ **Token Already Registered!**\n\nThis bot token is already registered in our system. Please use a different bot token:');
      return null;
    }

    await ctx.reply('🔍 Validating your bot token... Please wait.');

    try {
      // Validate the token with Telegram API
      const validationResult = await tokenValidator.validateToken(token);
      
      if (validationResult.isValid) {
        // Save the bot to database
        const savedBot = await botService.createBot({
          email: session.data.email,
          botName: session.data.botName,
          botToken: token,
          botUsername: validationResult.botInfo.username,
          botId: validationResult.botInfo.id,
          registeredBy: ctx.from.id,
          userInfo: {
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            username: ctx.from.username
          }
        });

        // Clear registration session
        this.registrationSessions.delete(ctx.from.id);
        
        // Create success message with optional warning
        let successMessage = `✅ **Registration Successful!**\n\n📧 **Email:** ${session.data.email}\n🤖 **Bot Name:** ${session.data.botName}\n👤 **Bot Username:** @${validationResult.botInfo.username}\n🆔 **Bot ID:** ${validationResult.botInfo.id}\n📅 **Registered:** ${new Date().toLocaleString()}`;
        
        // Add warning if bot is not running
        if (validationResult.warning) {
          successMessage += `\n\n⚠️ **Note:** ${validationResult.warning}`;
        }
        
        successMessage += `\n\nYour bot is now registered and ready to use!\n\nYou can now:\n• Start your bot with /start\n• Send messages to your bot\n• Use all bot features\n• Manage your bot settings\n\n🎉 Congratulations on creating your Telegram bot!`;
        
        await ctx.reply(successMessage);
        
        return { success: true, bot: savedBot };
        
      } else {
        // Token is invalid
        await ctx.reply(`❌ **Invalid Token!**\n\nError: ${validationResult.error}\n\nPlease check your token and try again. Make sure you copied it correctly from BotFather:`);
        return null;
      }
      
    } catch (error) {
      console.error('Token validation error:', error);
      await ctx.reply('❌ **Validation Error!**\n\nThere was an error validating your token. Please check your internet connection and try again:');
      return null;
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate bot name
   * @param {string} name - Bot name to validate
   * @returns {boolean} - Whether bot name is valid
   */
  isValidBotName(name) {
    return name && name.length >= 3 && name.length <= 32 && /^[a-zA-Z0-9_\s]+$/.test(name);
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {boolean} - Whether token format is valid
   */
  isValidTokenFormat(token) {
    const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
    return tokenRegex.test(token);
  }

  /**
   * Check if user has active registration session
   * @param {number} userId - User ID
   * @returns {boolean} - Whether user has active session
   */
  hasActiveSession(userId) {
    return this.registrationSessions.has(userId);
  }

  /**
   * Cancel registration for user
   * @param {number} userId - User ID
   */
  cancelRegistration(userId) {
    this.registrationSessions.delete(userId);
  }

  /**
   * Get registration session for user
   * @param {number} userId - User ID
   * @returns {Object|null} - Registration session or null
   */
  getSession(userId) {
    return this.registrationSessions.get(userId) || null;
  }

  /**
   * Get all active sessions
   * @returns {Array} - Array of active sessions
   */
  getAllSessions() {
    return Array.from(this.registrationSessions.entries());
  }

  /**
   * Get registration statistics
   * @returns {Promise<Object>} - Registration statistics
   */
  async getRegistrationStats() {
    try {
      const stats = await botService.getBotStats();
      const activeSessions = this.getAllSessions().length;
      
      return {
        ...stats,
        activeSessions,
        totalSessions: this.registrationSessions.size
      };
    } catch (error) {
      console.error('Error getting registration stats:', error);
      return {
        totalBots: 0,
        activeBots: 0,
        inactiveBots: 0,
        activeSessions: 0,
        totalSessions: 0
      };
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const timeout = 600000; // 10 minutes
    
    for (const [userId, session] of this.registrationSessions.entries()) {
      if (now - session.startTime > timeout) {
        this.registrationSessions.delete(userId);
        console.log(`Cleaned up expired session for user ${userId}`);
      }
    }
  }
}

// Create singleton instance
const registerModel = new Register();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  registerModel.cleanupExpiredSessions();
}, 5 * 60 * 1000);

// Export the register functions for use in registerForm.js
module.exports = {
  // Main registration functions
  startRegistration: (ctx) => registerModel.startRegistration(ctx),
  handleRegistrationInput: (ctx) => registerModel.handleRegistrationInput(ctx),
  
  // Session management functions
  hasActiveSession: (userId) => registerModel.hasActiveSession(userId),
  cancelRegistration: (userId) => registerModel.cancelRegistration(userId),
  getSession: (userId) => registerModel.getSession(userId),
  getAllSessions: () => registerModel.getAllSessions(),
  
  // Validation functions
  isValidEmail: (email) => registerModel.isValidEmail(email),
  isValidBotName: (name) => registerModel.isValidBotName(name),
  isValidTokenFormat: (token) => registerModel.isValidTokenFormat(token),
  
  // Statistics and utility functions
  getRegistrationStats: () => registerModel.getRegistrationStats(),
  cleanupExpiredSessions: () => registerModel.cleanupExpiredSessions(),
  
  // Export the model instance for direct access if needed
  registerModel
};