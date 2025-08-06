const Bot = require('../../BotA/models/Bot');

class UserTrackingService {
  constructor() {
    this.userBotInteractions = new Map(); // Map of userId -> botUsername
    this.interactionLogs = []; // Array to store interaction logs
  }

  /**
   * Log user interaction with a specific bot
   * @param {number} userId - Telegram user ID
   * @param {string} botUsername - Bot username
   * @param {string} messageType - Type of message (text, command, callback, etc.)
   * @param {string} messageContent - Content of the message
   * @param {Object} ctx - Telegram context
   */
  logUserInteraction(userId, botUsername, messageType, messageContent, ctx) {
    const timestamp = new Date().toISOString();
    const userInfo = {
      userId: userId,
      firstName: ctx.from?.first_name || 'Unknown',
      lastName: ctx.from?.last_name || '',
      username: ctx.from?.username || 'Unknown',
      botUsername: botUsername,
      messageType: messageType,
      messageContent: messageContent,
      timestamp: timestamp,
      chatId: ctx.chat?.id || 'Unknown'
    };

    // Store the interaction
    this.userBotInteractions.set(userId, botUsername);
    
    // Add to logs
    this.interactionLogs.push(userInfo);
    
    // Console log with clear formatting
    console.log(`\n🔍 USER INTERACTION DETECTED:`);
    console.log(`   👤 User ID: ${userId}`);
    console.log(`   👤 User Name: ${userInfo.firstName} ${userInfo.lastName}`);
    console.log(`   👤 Username: @${userInfo.username}`);
    console.log(`   🤖 Bot Username: @${botUsername}`);
    console.log(`   📝 Message Type: ${messageType}`);
    console.log(`   💬 Message: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`);
    console.log(`   ⏰ Timestamp: ${timestamp}`);
    console.log(`   💬 Chat ID: ${userInfo.chatId}`);
    console.log(`   ──────────────────────────────────────────`);

    // Keep only last 1000 logs to prevent memory issues
    if (this.interactionLogs.length > 1000) {
      this.interactionLogs = this.interactionLogs.slice(-1000);
    }
  }

  /**
   * Log command interaction
   * @param {number} userId - Telegram user ID
   * @param {string} botUsername - Bot username
   * @param {string} command - Command name
   * @param {Object} ctx - Telegram context
   */
  logCommandInteraction(userId, botUsername, command, ctx) {
    this.logUserInteraction(userId, botUsername, 'COMMAND', `/${command}`, ctx);
  }

  /**
   * Log text message interaction
   * @param {number} userId - Telegram user ID
   * @param {string} botUsername - Bot username
   * @param {string} text - Message text
   * @param {Object} ctx - Telegram context
   */
  logTextInteraction(userId, botUsername, text, ctx) {
    this.logUserInteraction(userId, botUsername, 'TEXT', text, ctx);
  }

  /**
   * Log callback query interaction
   * @param {number} userId - Telegram user ID
   * @param {string} botUsername - Bot username
   * @param {string} callbackData - Callback data
   * @param {Object} ctx - Telegram context
   */
  logCallbackInteraction(userId, botUsername, callbackData, ctx) {
    this.logUserInteraction(userId, botUsername, 'CALLBACK', callbackData, ctx);
  }

  /**
   * Log start command interaction
   * @param {number} userId - Telegram user ID
   * @param {string} botUsername - Bot username
   * @param {string} startParam - Start parameter
   * @param {Object} ctx - Telegram context
   */
  logStartInteraction(userId, botUsername, startParam, ctx) {
    const startMessage = startParam ? `/start ${startParam}` : '/start';
    this.logUserInteraction(userId, botUsername, 'START', startMessage, ctx);
  }

  /**
   * Get user's current bot
   * @param {number} userId - Telegram user ID
   * @returns {string|null} Bot username or null
   */
  getUserCurrentBot(userId) {
    return this.userBotInteractions.get(userId) || null;
  }

  /**
   * Get all users for a specific bot
   * @param {string} botUsername - Bot username
   * @returns {Array} Array of user IDs
   */
  getBotUsers(botUsername) {
    const users = [];
    for (const [userId, userBotUsername] of this.userBotInteractions.entries()) {
      if (userBotUsername === botUsername) {
        users.push(userId);
      }
    }
    return users;
  }

  /**
   * Get interaction statistics
   * @returns {Object} Statistics object
   */
  getInteractionStats() {
    const stats = {
      totalInteractions: this.interactionLogs.length,
      uniqueUsers: new Set(this.userBotInteractions.keys()).size,
      botInteractions: {},
      recentInteractions: this.interactionLogs.slice(-10) // Last 10 interactions
    };

    // Count interactions per bot
    for (const log of this.interactionLogs) {
      if (!stats.botInteractions[log.botUsername]) {
        stats.botInteractions[log.botUsername] = 0;
      }
      stats.botInteractions[log.botUsername]++;
    }

    return stats;
  }

  /**
   * Get user interaction history
   * @param {number} userId - Telegram user ID
   * @returns {Array} Array of user interactions
   */
  getUserHistory(userId) {
    return this.interactionLogs.filter(log => log.userId === userId);
  }

  /**
   * Get bot interaction history
   * @param {string} botUsername - Bot username
   * @returns {Array} Array of bot interactions
   */
  getBotHistory(botUsername) {
    return this.interactionLogs.filter(log => log.botUsername === botUsername);
  }

  /**
   * Clear old logs (older than specified hours)
   * @param {number} hours - Hours to keep
   */
  clearOldLogs(hours = 24) {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    this.interactionLogs = this.interactionLogs.filter(log => 
      new Date(log.timestamp) > cutoffTime
    );
    console.log(`🧹 Cleared logs older than ${hours} hours. Remaining logs: ${this.interactionLogs.length}`);
  }

  /**
   * Export logs to JSON
   * @returns {string} JSON string of logs
   */
  exportLogs() {
    return JSON.stringify(this.interactionLogs, null, 2);
  }

  /**
   * Print real-time statistics
   */
  printStats() {
    const stats = this.getInteractionStats();
    console.log(`\n📊 USER INTERACTION STATISTICS:`);
    console.log(`   📈 Total Interactions: ${stats.totalInteractions}`);
    console.log(`   👥 Unique Users: ${stats.uniqueUsers}`);
    console.log(`   🤖 Bot Interactions:`);
    for (const [botUsername, count] of Object.entries(stats.botInteractions)) {
      console.log(`      @${botUsername}: ${count} interactions`);
    }
    console.log(`   ──────────────────────────────────────────`);
  }
}

// Create singleton instance
const userTrackingService = new UserTrackingService();

// Clear old logs every 6 hours
setInterval(() => {
  userTrackingService.clearOldLogs(24);
}, 6 * 60 * 60 * 1000);

module.exports = userTrackingService; 