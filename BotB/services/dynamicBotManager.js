const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const mainController = require('../controllers/mainController');
const SchedulerService = require('./scheduler');

// Define Bot schema locally to avoid cross-project dependencies
const botSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  botName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 32
  },
  botToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  botUsername: {
    type: String,
    trim: true
  },
  botId: {
    type: Number
  },
  registeredBy: {
    type: Number,
    required: true
  },
  userInfo: {
    firstName: String,
    lastName: String,
    username: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastValidated: {
    type: Date,
    default: Date.now
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Bot = mongoose.model('Bot', botSchema);

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
      
      // Wait for MongoDB connection to be ready
      if (mongoose.connection.readyState !== 1) {
        console.log('⏳ Waiting for MongoDB connection...');
        await new Promise((resolve) => {
          mongoose.connection.on('connected', resolve);
          // Timeout after 30 seconds
          setTimeout(() => {
            if (mongoose.connection.readyState !== 1) {
              console.log('⚠️ MongoDB connection timeout, proceeding anyway...');
              resolve();
            }
          }, 30000);
        });
      }
      
      // Get all active bots from database with timeout
      const activeBots = await Promise.race([
        Bot.find({ isActive: true }).maxTimeMS(15000),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 15000)
        )
      ]);

      console.log(`📊 Found ${activeBots.length} active bots in database`);
      
      if (activeBots.length === 0) {
        console.log('📭 No active bots found in database');
        console.log('💡 Bots can be registered via webhook from BotA');
        return;
      }
      
      // Initialize each bot and track results
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < activeBots.length; i++) {
        const botData = activeBots[i];
        console.log(`\n🔄 [${i + 1}/${activeBots.length}] Initializing bot...`);
        
        const success = await this.startBot(botData);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
        
        // Small delay between bot startups to avoid rate limits
        if (i < activeBots.length - 1) {
          console.log('⏳ Waiting 2 seconds before next bot...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('\n📈 Bot Initialization Summary:');
      console.log(`   ✅ Successfully started: ${successCount}/${activeBots.length}`);
      console.log(`   ❌ Failed to start: ${failureCount}/${activeBots.length}`);
      console.log(`   🤖 Total active bots: ${this.activeBots.size}`);
      
      if (failureCount > 0) {
        console.log('\n💡 Common reasons for bot startup failure:');
        console.log('   • Invalid or expired bot tokens');
        console.log('   • Bots already running elsewhere');
        console.log('   • Network connectivity issues');
        console.log('   • Rate limiting from Telegram');
      }
    } catch (error) {
      console.error('❌ Error initializing dynamic bots:', error);
      console.log('🔄 Bot system will continue without pre-registered bots');
      console.log('💡 New bots can still be registered via webhook');
    }
  }

  /**
   * Start a specific bot instance
   * @param {Object} botData - Bot data from database
   */
  async startBot(botData) {
    try {
      const { botToken, botUsername, agentId, email, botName } = botData;
      
      console.log(`🚀 Attempting to start bot @${botUsername} (${botName})`);
      console.log(`   Token: ${botToken.substring(0, 10)}...`);
      
      // Check if bot is already running
      if (this.activeBots.has(botUsername)) {
        console.log(`⚠️ Bot @${botUsername} is already running`);
        return false;
      }

      // Validate bot token format
      if (!botToken || !botToken.includes(':')) {
        console.error(`❌ Invalid bot token format for @${botUsername}`);
        return false;
      }

      // Create new bot instance
      const bot = new Telegraf(botToken);
      
      // Add error handlers before launching
      bot.catch((err, ctx) => {
        console.error(`🚨 Bot @${botUsername} error:`, err.message);
        if (ctx) {
          ctx.reply('An error occurred. Please try again.').catch(() => {});
        }
      });
      
      // Create scheduler for this bot
      const scheduler = new SchedulerService(bot);
      
      // Initialize main controller with dynamic bot manager reference
      mainController(bot, scheduler, this);
      
      console.log(`⏳ Launching bot @${botUsername}...`);
      
      // Launch the bot with timeout
      const launchPromise = bot.launch();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Launch timeout after 30 seconds')), 30000)
      );
      
      await Promise.race([launchPromise, timeoutPromise]);
      
      // Test the bot by getting its info
      try {
        const botInfo = await bot.telegram.getMe();
        console.log(`📋 Bot info: @${botInfo.username} (ID: ${botInfo.id})`);
        
        // Update bot data if username is missing
        if (!botUsername && botInfo.username) {
          await Bot.findByIdAndUpdate(botData._id, { 
            botUsername: botInfo.username,
            botId: botInfo.id 
          });
          console.log(`📝 Updated bot username: @${botInfo.username}`);
        }
        
      } catch (infoError) {
        console.error(`⚠️ Could not get bot info for @${botUsername}:`, infoError.message);
      }
      
      // Store bot and scheduler instances
      this.activeBots.set(botUsername || botData._id, bot);
      this.schedulers.set(botUsername || botData._id, scheduler);
      
      console.log(`✅ Bot @${botUsername} (${botName}) started successfully`);
      console.log(`   Agent ID: ${agentId}`);
      console.log(`   Email: ${email}`);
      console.log(`   Status: Active and responding`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error starting bot @${botData.botUsername || 'unknown'}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Token: ${botData.botToken?.substring(0, 10)}...`);
      
      // Common error diagnostics
      if (error.message.includes('401')) {
        console.error(`   💡 Bot token is invalid or expired`);
      } else if (error.message.includes('409')) {
        console.error(`   💡 Bot is already running elsewhere or webhook conflict`);
      } else if (error.message.includes('timeout')) {
        console.error(`   💡 Network timeout - check connectivity`);
      } else if (error.message.includes('ENOTFOUND')) {
        console.error(`   💡 DNS resolution failed - check internet connection`);
      }
      
      return false;
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