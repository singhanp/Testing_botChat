const User = require('../models/User');

class UserService {
  // Find user by chat ID
  async findUserByChatId(chatId) {
    try {
      return await User.findOne({ chatId });
    } catch (error) {
      console.error('Error finding user by chat ID:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(chatId, updateData) {
    try {
      return await User.findOneAndUpdate(
        { chatId },
        { ...updateData, lastUpdated: new Date() },
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      return await User.find({});
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get users with good morning enabled
  async getUsersWithGoodMorningEnabled() {
    try {
      return await User.find({ goodMorningEnabled: true });
    } catch (error) {
      console.error('Error getting users with good morning enabled:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(chatId) {
    try {
      return await User.findOneAndDelete({ chatId });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Toggle good morning setting
  async toggleGoodMorning(chatId) {
    try {
      const user = await User.findOne({ chatId });
      if (!user) {
        throw new Error('User not found');
      }
      
      user.goodMorningEnabled = !user.goodMorningEnabled;
      return await user.save();
    } catch (error) {
      console.error('Error toggling good morning setting:', error);
      throw error;
    }
  }

  // Migrate data from JSON to MongoDB
  async migrateFromJSON(jsonData) {
    try {
      const results = [];
      for (const userData of jsonData) {
        const existingUser = await this.findUserByChatId(userData.chatId);
        if (!existingUser) {
          const user = await this.createUser(userData);
          results.push({ action: 'created', user });
        } else {
          results.push({ action: 'skipped', user: existingUser });
        }
      }
      return results;
    } catch (error) {
      console.error('Error migrating data from JSON:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 