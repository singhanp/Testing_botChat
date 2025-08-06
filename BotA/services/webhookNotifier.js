const axios = require('axios');

class WebhookNotifier {
  constructor() {
    this.botBWebhookUrl = process.env.BOT_B_WEBHOOK_URL || 'http://localhost:3001/webhook/bot-registration';
  }

  /**
   * Notify BotB about new bot registration
   * @param {Object} botData - Bot data that was registered
   */
  async notifyBotRegistration(botData) {
    try {
      const payload = {
        action: 'bot_registered',
        botData: {
          agentId: botData.agentId,
          email: botData.email,
          botName: botData.botName,
          botToken: botData.botToken,
          botUsername: botData.botUsername,
          botId: botData.botId,
          registeredBy: botData.registeredBy,
          userInfo: botData.userInfo,
          isActive: botData.isActive,
          registeredAt: botData.registeredAt
        }
      };

      console.log(`📡 Notifying BotB about new bot registration: @${botData.botUsername}`);
      
      const response = await axios.post(this.botBWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.status === 200) {
        console.log(`✅ BotB notification successful for @${botData.botUsername}`);
      } else {
        console.log(`⚠️ BotB notification returned status ${response.status} for @${botData.botUsername}`);
      }

    } catch (error) {
      console.error(`❌ Failed to notify BotB about bot registration @${botData.botUsername}:`, error.message);
      // Don't throw error - this shouldn't break the registration process
    }
  }

  /**
   * Notify BotB about bot deactivation
   * @param {Object} botData - Bot data that was deactivated
   */
  async notifyBotDeactivation(botData) {
    try {
      const payload = {
        action: 'bot_deactivated',
        botData: {
          botUsername: botData.botUsername,
          agentId: botData.agentId,
          email: botData.email
        }
      };

      console.log(`📡 Notifying BotB about bot deactivation: @${botData.botUsername}`);
      
      const response = await axios.post(this.botBWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.status === 200) {
        console.log(`✅ BotB deactivation notification successful for @${botData.botUsername}`);
      } else {
        console.log(`⚠️ BotB deactivation notification returned status ${response.status} for @${botData.botUsername}`);
      }

    } catch (error) {
      console.error(`❌ Failed to notify BotB about bot deactivation @${botData.botUsername}:`, error.message);
    }
  }

  /**
   * Notify BotB about bot update
   * @param {Object} botData - Updated bot data
   */
  async notifyBotUpdate(botData) {
    try {
      const payload = {
        action: 'bot_updated',
        botData: {
          agentId: botData.agentId,
          email: botData.email,
          botName: botData.botName,
          botToken: botData.botToken,
          botUsername: botData.botUsername,
          botId: botData.botId,
          isActive: botData.isActive,
          lastUpdated: botData.lastUpdated
        }
      };

      console.log(`📡 Notifying BotB about bot update: @${botData.botUsername}`);
      
      const response = await axios.post(this.botBWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.status === 200) {
        console.log(`✅ BotB update notification successful for @${botData.botUsername}`);
      } else {
        console.log(`⚠️ BotB update notification returned status ${response.status} for @${botData.botUsername}`);
      }

    } catch (error) {
      console.error(`❌ Failed to notify BotB about bot update @${botData.botUsername}:`, error.message);
    }
  }

  /**
   * Test webhook connectivity
   * @returns {Promise<boolean>} Whether webhook is reachable
   */
  async testWebhookConnection() {
    try {
      const response = await axios.get(this.botBWebhookUrl.replace('/webhook/bot-registration', '/health'), {
        timeout: 3000
      });
      
      if (response.status === 200) {
        console.log('✅ BotB webhook service is reachable');
        return true;
      } else {
        console.log('⚠️ BotB webhook service returned unexpected status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ BotB webhook service is not reachable:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const webhookNotifier = new WebhookNotifier();

module.exports = webhookNotifier; 