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
      'Valorant': 'https://via.placeholder.com/400x200/ff4655/ffffff?text=VALORANT',
      'CS 2': 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
      'Marvel Rivals': 'https://cdn2.unrealengine.com/marvel-rivals-breaker-image-1920x1080-1920x1080-7c9b1d40a431.jpg',
      'Snake Game': 'https://via.placeholder.com/400x200/4CAF50/ffffff?text=SNAKE+GAME',
      'Pac-Man': 'https://via.placeholder.com/400x200/FFEB3B/000000?text=PAC-MAN',
      'Tetris': 'https://via.placeholder.com/400x200/9C27B0/ffffff?text=TETRIS',
      'Chess Online': 'https://via.placeholder.com/400x200/795548/ffffff?text=CHESS',
      'Tic Tac Toe': 'https://via.placeholder.com/400x200/607D8B/ffffff?text=TIC+TAC+TOE',
      'Sudoku': 'https://via.placeholder.com/400x200/3F51B5/ffffff?text=SUDOKU',
      '2048 Game': 'https://via.placeholder.com/400x200/FF9800/ffffff?text=2048',
      'Solitaire': 'https://via.placeholder.com/400x200/8BC34A/ffffff?text=SOLITAIRE',
      'Minesweeper': 'https://via.placeholder.com/400x200/F44336/ffffff?text=MINESWEEPER',
      'Word Search': 'https://via.placeholder.com/400x200/E91E63/ffffff?text=WORD+SEARCH',
      'Crossword': 'https://via.placeholder.com/400x200/673AB7/ffffff?text=CROSSWORD',
      'Bubble Shooter': 'https://via.placeholder.com/400x200/00BCD4/ffffff?text=BUBBLE+SHOOTER'
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
