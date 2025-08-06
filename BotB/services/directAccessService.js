const Bot = require('../../BotA/models/Bot');

class DirectAccessService {
  constructor() {
    this.pendingDirectAccess = new Map(); // Map of userId -> botUsername
  }

  /**
   * Register a user for direct access to a specific bot
   * @param {number} userId - Telegram user ID
   * @param {string} botUsername - Bot username to access
   */
  registerDirectAccess(userId, botUsername) {
    this.pendingDirectAccess.set(userId, botUsername);
    console.log(`🔗 Direct access registered for user ${userId} to @${botUsername}`);
  }

  /**
   * Check if user has pending direct access
   * @param {number} userId - Telegram user ID
   * @returns {string|null} Bot username or null
   */
  getPendingDirectAccess(userId) {
    return this.pendingDirectAccess.get(userId) || null;
  }

  /**
   * Clear pending direct access for user
   * @param {number} userId - Telegram user ID
   */
  clearPendingDirectAccess(userId) {
    this.pendingDirectAccess.delete(userId);
  }

  /**
   * Handle direct access when user starts a bot
   * @param {Object} ctx - Telegram context
   * @param {Function} dynamicBotManager - Dynamic bot manager instance
   */
  async handleDirectAccess(ctx, dynamicBotManager) {
    const userId = ctx.from.id;
    const botUsername = this.getPendingDirectAccess(userId);
    
    if (!botUsername) {
      return false; // No direct access pending
    }

    try {
      // Check if the bot is active
      if (!dynamicBotManager.isBotActive(botUsername)) {
        await ctx.reply(`❌ Bot @${botUsername} is not currently active. Please contact support.`);
        this.clearPendingDirectAccess(userId);
        return true;
      }

      // Get bot instance
      const botInstance = dynamicBotManager.getBotInstance(botUsername);
      if (!botInstance) {
        await ctx.reply(`❌ Bot @${botUsername} instance not found. Please contact support.`);
        this.clearPendingDirectAccess(userId);
        return true;
      }

      // Send welcome message for direct access
      const welcomeMessage = `🎉 Welcome to @${botUsername}!\n\nYou have been granted direct access to this bot.\n\nPlease use the commands below to interact with the bot:`;
      
      await ctx.reply(welcomeMessage);
      
      // Clear the pending direct access
      this.clearPendingDirectAccess(userId);
      
      console.log(`✅ Direct access completed for user ${userId} to @${botUsername}`);
      return true;

    } catch (error) {
      console.error(`❌ Error handling direct access for user ${userId}:`, error);
      this.clearPendingDirectAccess(userId);
      return true;
    }
  }

  /**
   * Create direct access link for a bot
   * @param {string} botUsername - Bot username
   * @param {string} botToken - Bot token
   * @returns {string} Direct access link
   */
  createDirectAccessLink(botUsername, botToken) {
    // Create a deep link that will trigger direct access
    return `https://t.me/${botUsername}?start=direct_access`;
  }

  /**
   * Handle start command with direct access parameter
   * @param {Object} ctx - Telegram context
   * @param {Function} dynamicBotManager - Dynamic bot manager instance
   */
  async handleStartWithDirectAccess(ctx, dynamicBotManager) {
    const startParam = ctx.message.text.split(' ')[1];
    
    if (startParam === 'direct_access') {
      const userId = ctx.from.id;
      const botUsername = ctx.botInfo.username;
      
      // Register direct access for this user
      this.registerDirectAccess(userId, botUsername);
      
      // Handle the direct access
      await this.handleDirectAccess(ctx, dynamicBotManager);
      return true;
    }
    
    return false; // Not a direct access start command
  }

  /**
   * Get statistics about direct access
   * @returns {Object} Direct access statistics
   */
  getDirectAccessStats() {
    return {
      pendingAccess: this.pendingDirectAccess.size,
      pendingUsers: Array.from(this.pendingDirectAccess.keys())
    };
  }

  /**
   * Clean up expired direct access (older than 1 hour)
   */
  cleanupExpiredDirectAccess() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [userId, botUsername] of this.pendingDirectAccess.entries()) {
      // For now, we'll just log - in a real implementation, you might want to track timestamps
      console.log(`🧹 Cleaning up direct access for user ${userId} to @${botUsername}`);
    }
    
    // Clear all pending access (simple cleanup for demo)
    this.pendingDirectAccess.clear();
  }
}

// Create singleton instance
const directAccessService = new DirectAccessService();

// Clean up expired direct access every hour
setInterval(() => {
  directAccessService.cleanupExpiredDirectAccess();
}, 60 * 60 * 1000);

module.exports = directAccessService; 