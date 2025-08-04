const Bot = require('../models/Bot');

class BotService {
  // Find bot by token
  async findBotByToken(token) {
    try {
      return await Bot.findOne({ botToken: token, isActive: true });
    } catch (error) {
      console.error('Error finding bot by token:', error);
      throw error;
    }
  }

  // Find bot by email
  async findBotByEmail(email) {
    try {
      return await Bot.findOne({ email: email.toLowerCase(), isActive: true });
    } catch (error) {
      console.error('Error finding bot by email:', error);
      throw error;
    }
  }

  // Find bot by registered user ID
  async findBotsByUser(userId) {
    try {
      return await Bot.find({ registeredBy: userId, isActive: true });
    } catch (error) {
      console.error('Error finding bots by user:', error);
      throw error;
    }
  }

  // Create new bot
  async createBot(botData) {
    try {
      const bot = new Bot(botData);
      return await bot.save();
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  }

  // Update bot
  async updateBot(botId, updateData) {
    try {
      return await Bot.findByIdAndUpdate(
        botId,
        { ...updateData, lastUpdated: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating bot:', error);
      throw error;
    }
  }

  // Get all active bots
  async getAllActiveBots() {
    try {
      return await Bot.find({ isActive: true });
    } catch (error) {
      console.error('Error getting all active bots:', error);
      throw error;
    }
  }

  // Get bot statistics
  async getBotStats() {
    try {
      const totalBots = await Bot.countDocuments();
      const activeBots = await Bot.countDocuments({ isActive: true });
      const inactiveBots = totalBots - activeBots;
      
      return {
        totalBots,
        activeBots,
        inactiveBots
      };
    } catch (error) {
      console.error('Error getting bot stats:', error);
      throw error;
    }
  }

  // Check if email already has a registered bot
  async isEmailRegistered(email) {
    try {
      const bot = await Bot.findOne({ email: email.toLowerCase(), isActive: true });
      return !!bot;
    } catch (error) {
      console.error('Error checking email registration:', error);
      throw error;
    }
  }

  // Check if token already exists
  async isTokenExists(token) {
    try {
      const bot = await Bot.findOne({ botToken: token, isActive: true });
      return !!bot;
    } catch (error) {
      console.error('Error checking token existence:', error);
      throw error;
    }
  }

  // Deactivate bot (soft delete)
  async deactivateBot(botId) {
    try {
      return await Bot.findByIdAndUpdate(
        botId,
        { isActive: false, lastUpdated: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error deactivating bot:', error);
      throw error;
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate bot name
  isValidBotName(name) {
    return name && name.length >= 3 && name.length <= 32 && /^[a-zA-Z0-9_\s]+$/.test(name);
  }

  // Validate token format
  isValidTokenFormat(token) {
    const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
    return tokenRegex.test(token);
  }
}

// Create singleton instance
const botService = new BotService();

module.exports = botService; 