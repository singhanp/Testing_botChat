const { MongoClient } = require('mongodb');

class GameListAPI {
  constructor() {
    this.uri = 'mongodb://cryptouser:Q21K9WF7g1ssmQa447@ugcrypto-center-db-system.mongodb.singapore.rds.aliyuncs.com:3717/';
    this.client = new MongoClient(this.uri);
    this.dbName = 'telebot';
    this.collectionName = 'gamelist';
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('✅ Connected to MongoDB for GameList API');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      return false;
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  async getAllGames() {
    try {
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      const games = await collection.find({}).toArray();
      
      // Transform the data to match the expected format for the bot
      const transformedGames = games.map((game, index) => ({
        name: game.game_name || `Game ${index + 1}`,
        emoji: this.getRandomGameEmoji(), // Add random emoji since it's not in DB
        data: `game_${game._id}`, // Use MongoDB ID for callback data
        url: game.url || 'https://www.google.com/' // Default URL if empty
      }));

      console.log(`📊 Fetched ${transformedGames.length} games from database`);
      return transformedGames;

    } catch (error) {
      console.error('❌ Error fetching games:', error.message);
      // Return empty array if there's an error
      return [];
    }
  }

  async getGameById(gameId) {
    try {
      const { ObjectId } = require('mongodb');
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      const game = await collection.findOne({ _id: new ObjectId(gameId) });
      
      if (game) {
        return {
          id: game._id,
          name: game.game_name,
          url: game.url || 'https://www.google.com/'
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching game by ID:', error.message);
      return null;
    }
  }

  async addGame(gameName, gameUrl) {
    try {
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      const newGame = {
        game_name: gameName,
        url: gameUrl || '',
        created_at: new Date()
      };
      
      const result = await collection.insertOne(newGame);
      console.log(`✅ Added new game: ${gameName}`);
      return result.insertedId;
      
    } catch (error) {
      console.error('❌ Error adding game:', error.message);
      return null;
    }
  }

  async updateGame(gameId, gameName, gameUrl) {
    try {
      const { ObjectId } = require('mongodb');
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      const updateData = {
        updated_at: new Date()
      };
      
      if (gameName) updateData.game_name = gameName;
      if (gameUrl !== undefined) updateData.url = gameUrl;
      
      const result = await collection.updateOne(
        { _id: new ObjectId(gameId) },
        { $set: updateData }
      );
      
      console.log(`✅ Updated game ${gameId}`);
      return result.matchedCount > 0;
      
    } catch (error) {
      console.error('❌ Error updating game:', error.message);
      return false;
    }
  }

  async deleteGame(gameId) {
    try {
      const { ObjectId } = require('mongodb');
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      const result = await collection.deleteOne({ _id: new ObjectId(gameId) });
      console.log(`✅ Deleted game ${gameId}`);
      return result.deletedCount > 0;
      
    } catch (error) {
      console.error('❌ Error deleting game:', error.message);
      return false;
    }
  }

  getRandomGameEmoji() {
    const gameEmojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎳', '🎰', '🎊', '🎉', '🏆', '🏅', '⚽', '🏀', '🎱', '🎯', '🎮'];
    return gameEmojis[Math.floor(Math.random() * gameEmojis.length)];
  }
}

// Singleton instance
const gameListAPI = new GameListAPI();

// Export functions for easy use
module.exports = {
  // Main functions
  async getGames() {
    const connected = await gameListAPI.connect();
    if (!connected) {
      // Return fallback data if connection fails
      return [
        { name: 'Connection Error', emoji: '❌', data: 'error', url: 'https://www.google.com/' }
      ];
    }
    
    try {
      const games = await gameListAPI.getAllGames();
      return games;
    } finally {
      await gameListAPI.disconnect();
    }
  },

  async getGameById(gameId) {
    const connected = await gameListAPI.connect();
    if (!connected) return null;
    
    try {
      return await gameListAPI.getGameById(gameId);
    } finally {
      await gameListAPI.disconnect();
    }
  },

  async addGame(gameName, gameUrl) {
    const connected = await gameListAPI.connect();
    if (!connected) return null;
    
    try {
      return await gameListAPI.addGame(gameName, gameUrl);
    } finally {
      await gameListAPI.disconnect();
    }
  },

  async updateGame(gameId, gameName, gameUrl) {
    const connected = await gameListAPI.connect();
    if (!connected) return false;
    
    try {
      return await gameListAPI.updateGame(gameId, gameName, gameUrl);
    } finally {
      await gameListAPI.disconnect();
    }
  },

  async deleteGame(gameId) {
    const connected = await gameListAPI.connect();
    if (!connected) return false;
    
    try {
      return await gameListAPI.deleteGame(gameId);
    } finally {
      await gameListAPI.disconnect();
    }
  },

  // Direct access to the API class if needed
  GameListAPI: gameListAPI
};
