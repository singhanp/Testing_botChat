const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const Bot = require('../../BotA/models/Bot'); // Import Bot model from BotA
const mainController = require('../controllers/mainController');
const SchedulerService = require('./scheduler');

class DynamicBotManager {
  constructor() {
    this.activeBots = new Map(); // Map of botUsername -> bot instance
    this.schedulers = new Map(); // Map of botUsername -> scheduler instance
  }

  /**
   * Initialize and start all registered bots
   */
  async initializeBots() {
    try {
      console.log('🔄 Initializing dynamic bots from database...');
      
      // Get all active bots from database
      const activeBots = await Bot.find({ isActive: true });

      console.log(`📊 Found ${activeBots.length} active bots in database`);
      
      // Initialize each bot
      for (const botData of activeBots) {
        await this.startBot(botData);
      }
      
      console.log('✅ All dynamic bots initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing dynamic bots:', error);
    }
  }

  /**
   * Start a specific bot instance
   * @param {Object} botData - Bot data from database
   */
  async startBot(botData) {
    try {
      const { botToken, botUsername, agentId, email, botName } = botData;
      
      // Check if bot is already running
      if (this.activeBots.has(botUsername)) {
        console.log(`⚠️ Bot @${botUsername} is already running`);
        return;
      }

      // Create new bot instance
      const bot = new Telegraf(botToken);
      
      // Create scheduler for this bot
      const scheduler = new SchedulerService(bot);
      
      // Initialize main controller with dynamic bot manager reference
      mainController(bot, scheduler, this);
      
      // Launch the bot
      await bot.launch();
      
      // Store bot and scheduler instances
      this.activeBots.set(botUsername, bot);
      this.schedulers.set(botUsername, scheduler);
      
      console.log(`✅ Bot @${botUsername} (${botName}) started successfully`);
      console.log(`   Agent ID: ${agentId}`);
      console.log(`   Email: ${email}`);
      
    } catch (error) {
      console.error(`❌ Error starting bot @${botData.botUsername}:`, error);
    }
  }

  /**
   * Stop a specific bot instance
   * @param {string} botUsername - Bot username to stop
   */
  async stopBot(botUsername) {
    try {
      const bot = this.activeBots.get(botUsername);
      if (bot) {
        await bot.stop();
        this.activeBots.delete(botUsername);
        this.schedulers.delete(botUsername);
        console.log(`🛑 Bot @${botUsername} stopped successfully`);
      }
    } catch (error) {
      console.error(`❌ Error stopping bot @${botUsername}:`, error);
    }
  }

  /**
   * Restart a specific bot instance
   * @param {string} botUsername - Bot username to restart
   */
  async restartBot(botUsername) {
    try {
      await this.stopBot(botUsername);
      
      // Get fresh data from database
      const botData = await Bot.findOne({ botUsername, isActive: true });
      if (botData) {
        await this.startBot(botData);
      }
    } catch (error) {
      console.error(`❌ Error restarting bot @${botUsername}:`, error);
    }
  }

  /**
   * Handle new bot registration (called when BotA registers a new bot)
   * @param {Object} botData - New bot data
   */
  async handleNewBotRegistration(botData) {
    try {
      console.log(`🆕 New bot registration detected: @${botData.botUsername}`);
      await this.startBot(botData);
    } catch (error) {
      console.error('❌ Error handling new bot registration:', error);
    }
  }

  /**
   * Handle bot deactivation
   * @param {string} botUsername - Bot username to deactivate
   */
  async handleBotDeactivation(botUsername) {
    try {
      console.log(`🔄 Bot deactivation detected: @${botUsername}`);
      await this.stopBot(botUsername);
    } catch (error) {
      console.error('❌ Error handling bot deactivation:', error);
    }
  }

  /**
   * Get all active bot instances
   * @returns {Array} Array of active bot usernames
   */
  getActiveBots() {
    return Array.from(this.activeBots.keys());
  }

  /**
   * Get bot instance by username
   * @param {string} botUsername - Bot username
   * @returns {Telegraf|null} Bot instance or null
   */
  getBotInstance(botUsername) {
    return this.activeBots.get(botUsername) || null;
  }

  /**
   * Get scheduler instance by username
   * @param {string} botUsername - Bot username
   * @returns {SchedulerService|null} Scheduler instance or null
   */
  getSchedulerInstance(botUsername) {
    return this.schedulers.get(botUsername) || null;
  }

  /**
   * Check if a bot is currently active
   * @param {string} botUsername - Bot username
   * @returns {boolean} Whether bot is active
   */
  isBotActive(botUsername) {
    return this.activeBots.has(botUsername);
  }

  /**
   * Get bot statistics
   * @returns {Object} Bot statistics
   */
  getStats() {
    return {
      activeBots: this.activeBots.size,
      botUsernames: this.getActiveBots(),
      totalSchedulers: this.schedulers.size
    };
  }

  /**
   * Gracefully shutdown all bots
   */
  async shutdownAllBots() {
    try {
      console.log('🛑 Shutting down all dynamic bots...');
      
      const shutdownPromises = Array.from(this.activeBots.keys()).map(botUsername => 
        this.stopBot(botUsername)
      );
      
      await Promise.all(shutdownPromises);
      console.log('✅ All dynamic bots shut down successfully');
    } catch (error) {
      console.error('❌ Error shutting down bots:', error);
    }
  }
}

// Create singleton instance
const dynamicBotManager = new DynamicBotManager();

module.exports = dynamicBotManager; 