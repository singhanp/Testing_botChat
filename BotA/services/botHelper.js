const { authService, getUserRole, getUserInfo } = require('./auth');

class BotHelper {
  constructor(botA, botB) {
    this.botA = botA;
    this.botB = botB;
  }

  // Auto-start Bot B for a user
  async autoStartBotB(userId, firstName) {
    try {
      await this.botB.telegram.sendMessage(userId, 
        `🎉 Welcome ${firstName}! You have been automatically logged in to the main bot.\n\nUse /start to see your personalized interface based on your role.`
      );
      console.log(`✅ Auto-started Bot B for user ${userId}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Could not auto-start Bot B for user ${userId}:`, error.message);
      return false;
    }
  }

  // Send welcome message to user in Bot B
  async sendBotBWelcome(userId, firstName, userRole, userInfo) {
    try {
      let welcomeMessage = '';
      let keyboard = null;

      switch (userRole) {
        case 'super_admin':
          welcomeMessage = `👑 Welcome Super Admin ${firstName}!\n\n🔹 You have full system access\n🔹 Manage all agents and members\n🔹 View system-wide statistics\n🔹 Configure system settings\n\nWhat would you like to do?`;
          keyboard = this.getSuperAdminKeyboard();
          break;
          
        case 'agent':
          welcomeMessage = `👨‍💼 Welcome Agent ${firstName}!\n\n🔹 Manage your team members\n🔹 View your agent statistics\n🔹 Send messages to your members\n🔹 Configure your agent settings\n\nYour Agent Name: ${userInfo.agentName}`;
          keyboard = this.getAgentKeyboard(userInfo.agentName);
          break;
          
        case 'member':
          welcomeMessage = `🎮 Welcome ${firstName}!\n\n🔹 Play games and earn points\n🔹 View your personal statistics\n🔹 Browse image galleries\n🔹 Customize your preferences\n\nYour Agent: ${userInfo.agentInfo.agentName}`;
          keyboard = this.getMemberKeyboard();
          break;
          
        default:
          welcomeMessage = `🤖 Welcome to Interactive Bot!\n\nHi ${firstName}! I'm your interactive Telegram bot.\n\n🔹 I can send you images\n🔹 I can show interactive buttons\n🔹 I can respond to your choices\n🔹 I can send you different types of content\n\nTo access full features, please login or contact an agent to be added as a member.`;
          keyboard = this.getGuestKeyboard();
      }

      await this.botB.telegram.sendMessage(userId, welcomeMessage, { reply_markup: keyboard });
      return true;
    } catch (error) {
      console.error('Failed to send Bot B welcome:', error);
      return false;
    }
  }

  // Get keyboard layouts (simplified versions)
  getSuperAdminKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '👥 Manage Agents', callback_data: 'manage_agents' },
          { text: '📊 System Stats', callback_data: 'system_stats' }
        ],
        [
          { text: '🔧 System Settings', callback_data: 'system_settings' },
          { text: '📤 Broadcast', callback_data: 'broadcast_message' }
        ],
        [
          { text: '🚀 Demo', callback_data: 'start_demo' },
          { text: '🖼️ Gallery', callback_data: 'gallery' }
        ]
      ]
    };
  }

  getAgentKeyboard(agentName) {
    return {
      inline_keyboard: [
        [
          { text: `👥 Manage ${agentName} Members`, callback_data: 'manage_members' },
          { text: '📊 Agent Stats', callback_data: 'agent_stats' }
        ],
        [
          { text: '⚙️ Agent Settings', callback_data: 'agent_settings' },
          { text: '📤 Send Message', callback_data: 'send_to_members' }
        ],
        [
          { text: '🎮 Games', callback_data: 'games' },
          { text: '🖼️ Gallery', callback_data: 'gallery' }
        ]
      ]
    };
  }

  getMemberKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🎮 Play Games', callback_data: 'play_games' },
          { text: '📊 My Stats', callback_data: 'my_stats' }
        ],
        [
          { text: '🖼️ Gallery', callback_data: 'gallery' },
          { text: '🎲 Quick Games', callback_data: 'quick_games' }
        ],
        [
          { text: '⚙️ Settings', callback_data: 'member_settings' },
          { text: '❓ Help', callback_data: 'help' }
        ]
      ]
    };
  }

  getGuestKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🚀 Start Demo', callback_data: 'start_demo' },
          { text: '📋 Show Menu', callback_data: 'show_menu' }
        ],
        [
          { text: '🖼️ Gallery', callback_data: 'gallery' },
          { text: '❓ Help', callback_data: 'help' }
        ],
        [
          { text: '⚙️ Login', callback_data: 'login' }
        ]
      ]
    };
  }

  // Check if user has started Bot B
  async hasUserStartedBotB(userId) {
    try {
      // Try to get chat info - this will fail if user hasn't started the bot
      await this.botB.telegram.getChat(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get login URL for Bot B
  getBotBLoginUrl() {
    // You'll need to replace 'Hippo99bot' with your actual Bot B username
    return 'https://t.me/Hippo99bot?start=from_login';
  }
}

module.exports = BotHelper; 