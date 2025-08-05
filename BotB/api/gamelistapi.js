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
        id: game._id,
        name: game.game_name || `Game ${index + 1}`,
        emoji: this.getRandomGameEmoji(), // Add random emoji since it's not in DB
        data: `game_${game._id}`, // Use MongoDB ID for callback data
        url: game.url || 'https://www.google.com/', // Default URL if empty
        logo: game.logo || this.getDefaultGameLogo(game.game_name), // Game logo URL
        miniAppUrl: game.mini_app_url || game.url || 'https://www.google.com/', // Telegram Mini App URL
        description: game.description || `Play ${game.game_name || 'this game'} now!`
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

  async addGame(gameName, gameUrl, logoUrl = null, miniAppUrl = null, description = null) {
    try {
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      const newGame = {
        game_name: gameName,
        url: gameUrl || '',
        logo: logoUrl || this.getDefaultGameLogo(gameName),
        mini_app_url: miniAppUrl || gameUrl || '',
        description: description || `Play ${gameName} now!`,
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

  getDefaultGameLogo(gameName) {
    // Default game logos - you can replace these with actual logo URLs
    const defaultLogos = {
      'Dota 2': 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
      'Valorant': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt34c6649bf64bb74e/5eb7cdc65d73c20b52ca3c8b/V_AGENTS_587x900_Jett.jpg',
      'CS 2': 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
      'Marvel Rivals': 'https://cdn2.unrealengine.com/marvel-rivals-breaker-image-1920x1080-1920x1080-7c9b1d40a431.jpg',
      'Snake Game': 'https://play-lh.googleusercontent.com/MSjc1w8bNLM6hIuTpYpNbhqLY_qXnOH4SQrblNbhWOGmG4j8kw5gXL9E7L1N5P4wK40',
      'Pac-Man': 'https://logos-world.net/wp-content/uploads/2021/02/Pac-Man-Logo.png',
      'Tetris': 'https://upload.wikimedia.org/wikipedia/en/7/7f/Tetris_logo.png',
      'Chess Online': 'https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png',
      'Tic Tac Toe': 'https://play-lh.googleusercontent.com/pE01RkLeb_wWPQ7ZrJ1xEL4_9lFQyy_IFi59qYr_rB9F2S1LIqKWJkfb_YU7kz6MKw',
      'Sudoku': 'https://play-lh.googleusercontent.com/8R4m9fD_5bGFByFtZL5M5kMaZjm6hL_E2z7JxQ1n7V2x3fQUJ1L3kWVzUEjL_7oYNA',
      '2048 Game': 'https://play-lh.googleusercontent.com/C1VLh6C1xQwTCi5mVJ3YT8rD6d4Jz4LkJ3N7g1M6V9X3Lz8k2F4WqE2M9tY7bW',
      'Solitaire': 'https://play-lh.googleusercontent.com/GKcWDY3zUQXNLKRCN1wD4hA4Qg6JzQS1LmTYRv4k5B8lPqUdF3NsKj2Yx9Cg6M',
      'Minesweeper': 'https://play-lh.googleusercontent.com/7sQ4Jx5B8tN2F9D1K6L3WxYzP4V9R2M8CqE7Ug3H1FmL5kN4JpT8B7XzQ6Wy2',
      'Word Search': 'https://play-lh.googleusercontent.com/R2H4K5L3Yz1B9D7FxQ8M6N4TgWvUj2CpE9Y3L1FkS7NmT4B6XzQ5R8D3F1Ky9',
      'Crossword': 'https://play-lh.googleusercontent.com/3K9M2L7B4FxT1Yz6D8Q5N3R9CpE2U4WvJ1L8FkS6NmT7B3XzQ4R5D9F2Ky8',
      'Bubble Shooter': 'https://play-lh.googleusercontent.com/8D2F5L9M3Yz1B7K4N6Q3R8CpE4U2WvJ5L1FkS9NmT6B8XzQ7R3D2F4Ky1'
    };
    
    return defaultLogos[gameName] || 'https://via.placeholder.com/400x200/4285f4/ffffff?text=Game+Logo';
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
