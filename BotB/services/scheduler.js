const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class SchedulerService {
  constructor(bot) {
    this.bot = bot;
    this.usersFilePath = path.join(__dirname, '../database/users.json');
    this.initializeScheduler();
  }

  // Initialize the good morning scheduler
  initializeScheduler() {
    // Schedule for 8:00 AM every day
    cron.schedule('0 8 * * *', async () => {
      await this.sendGoodMorningMessages();
    }, {
      timezone: "UTC" // You can change this to your local timezone
    });

    console.log('📅 Good morning scheduler initialized - will send messages at 8:00 AM UTC daily');
  }

  // Send good morning messages to all subscribed users
  async sendGoodMorningMessages() {
    try {
      const users = await this.getUsers();
      const subscribedUsers = users.filter(user => user.goodMorningEnabled);

      const goodMorningMessages = [
        "🌅 Good morning! Have a wonderful day ahead! ☀️",
        "🌞 Rise and shine! Wishing you a fantastic day! ✨",
        "🌻 Good morning! May your day be filled with joy and success! 🌈",
        "☀️ Good morning! Start your day with a smile! 😊",
        "🌅 Wake up and be awesome! Good morning! 💪",
        "🌞 Good morning! Today is full of possibilities! 🚀",
        "☕ Good morning! Time to conquer the day! 🌟"
      ];

      for (const user of subscribedUsers) {
        try {
          const randomMessage = goodMorningMessages[Math.floor(Math.random() * goodMorningMessages.length)];
          await this.bot.telegram.sendMessage(user.chatId, randomMessage);
          console.log(`✅ Good morning message sent to user ${user.chatId}`);
        } catch (error) {
          console.error(`❌ Failed to send good morning message to user ${user.chatId}:`, error);
        }
      }

      if (subscribedUsers.length > 0) {
        console.log(`📤 Sent good morning messages to ${subscribedUsers.length} users`);
      }
    } catch (error) {
      console.error('❌ Error sending good morning messages:', error);
    }
  }

  // Get all users from the database
  async getUsers() {
    try {
      const data = await fs.readFile(this.usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Save users to the database
  async saveUsers(users) {
    await fs.writeFile(this.usersFilePath, JSON.stringify(users, null, 2));
  }

  // Add or update a user
  async addOrUpdateUser(chatId, firstName, lastName = '', goodMorningEnabled = false) {
    const users = await this.getUsers();
    const existingUserIndex = users.findIndex(user => user.chatId === chatId);

    const userData = {
      chatId,
      firstName,
      lastName,
      goodMorningEnabled,
      joinedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    if (existingUserIndex >= 0) {
      userData.joinedAt = users[existingUserIndex].joinedAt;
      users[existingUserIndex] = userData;
    } else {
      users.push(userData);
    }

    await this.saveUsers(users);
    return userData;
  }

  // Enable good morning messages for a user
  async enableGoodMorning(chatId, firstName, lastName = '') {
    const user = await this.addOrUpdateUser(chatId, firstName, lastName, true);
    console.log(`✅ Good morning enabled for user ${chatId} (${firstName})`);
    return user;
  }

  // Disable good morning messages for a user
  async disableGoodMorning(chatId) {
    const users = await this.getUsers();
    const userIndex = users.findIndex(user => user.chatId === chatId);
    
    if (userIndex >= 0) {
      users[userIndex].goodMorningEnabled = false;
      users[userIndex].lastUpdated = new Date().toISOString();
      await this.saveUsers(users);
      console.log(`❌ Good morning disabled for user ${chatId}`);
      return users[userIndex];
    }
    return null;
  }

  // Check if user has good morning enabled
  async isGoodMorningEnabled(chatId) {
    const users = await this.getUsers();
    const user = users.find(user => user.chatId === chatId);
    return user ? user.goodMorningEnabled : false;
  }

  // Get good morning statistics
  async getStats() {
    const users = await this.getUsers();
    const total = users.length;
    const subscribed = users.filter(user => user.goodMorningEnabled).length;
    
    return {
      totalUsers: total,
      subscribedUsers: subscribed,
      unsubscribedUsers: total - subscribed
    };
  }
}

module.exports = SchedulerService; 