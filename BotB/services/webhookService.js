const express = require('express');
const dynamicBotManager = require('./dynamicBotManager');
const Bot = require('../../BotA/models/Bot');
const userTrackingService = require('./userTrackingService');

class WebhookService {
  constructor() {
    this.app = express();
    this.port = process.env.WEBHOOK_PORT || 3001;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Webhook endpoint for BotA to notify about new bot registrations
    this.app.post('/webhook/bot-registration', async (req, res) => {
      try {
        const { action, botData } = req.body;
        
        console.log(`📨 Webhook received: ${action}`, botData);
        
        switch (action) {
          case 'bot_registered':
            await this.handleBotRegistration(botData);
            break;
          case 'bot_deactivated':
            await this.handleBotDeactivation(botData);
            break;
          case 'bot_updated':
            await this.handleBotUpdate(botData);
            break;
          default:
            console.log(`⚠️ Unknown webhook action: ${action}`);
        }
        
        res.json({ success: true, message: 'Webhook processed successfully' });
      } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const stats = dynamicBotManager.getStats();
      const userStats = userTrackingService.getInteractionStats();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats,
        userStats
      });
    });

    // Get all active bots
    this.app.get('/api/bots', async (req, res) => {
      try {
        const activeBots = await Bot.find({ isActive: true });
        res.json({
          success: true,
          data: activeBots,
          activeInstances: dynamicBotManager.getActiveBots()
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Restart a specific bot
    this.app.post('/api/bots/:username/restart', async (req, res) => {
      try {
        const { username } = req.params;
        await dynamicBotManager.restartBot(username);
        res.json({ success: true, message: `Bot @${username} restarted successfully` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Stop a specific bot
    this.app.post('/api/bots/:username/stop', async (req, res) => {
      try {
        const { username } = req.params;
        await dynamicBotManager.stopBot(username);
        res.json({ success: true, message: `Bot @${username} stopped successfully` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  async handleBotRegistration(botData) {
    try {
      console.log(`🆕 Handling bot registration: @${botData.botUsername}`);
      await dynamicBotManager.handleNewBotRegistration(botData);
    } catch (error) {
      console.error('❌ Error handling bot registration:', error);
    }
  }

  async handleBotDeactivation(botData) {
    try {
      console.log(`🔄 Handling bot deactivation: @${botData.botUsername}`);
      await dynamicBotManager.handleBotDeactivation(botData.botUsername);
    } catch (error) {
      console.error('❌ Error handling bot deactivation:', error);
    }
  }

  async handleBotUpdate(botData) {
    try {
      console.log(`🔄 Handling bot update: @${botData.botUsername}`);
      // Restart the bot to apply updates
      await dynamicBotManager.restartBot(botData.botUsername);
    } catch (error) {
      console.error('❌ Error handling bot update:', error);
    }
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🌐 Webhook service started on port ${this.port}`);
      console.log(`📡 Webhook endpoint: http://localhost:${this.port}/webhook/bot-registration`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`📋 API endpoint: http://localhost:${this.port}/api/bots`);
      
      // Print user tracking stats every 5 minutes
      setInterval(() => {
        userTrackingService.printStats();
      }, 5 * 60 * 1000);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Webhook service stopped');
    }
  }
}

module.exports = WebhookService; 