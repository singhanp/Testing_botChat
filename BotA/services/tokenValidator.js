const { Telegraf } = require('telegraf');

class TokenValidator {
  constructor() {
    this.validationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Validate a Telegram bot token
   * @param {string} token - The bot token to validate
   * @returns {Promise<Object>} - Validation result with isValid, botInfo, and error properties
   */
  async validateToken(token) {
    try {
      // Check cache first
      const cached = this.validationCache.get(token);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }

      // Basic format validation
      if (!this.isValidTokenFormat(token)) {
        return {
          isValid: false,
          error: 'Invalid token format. Token should contain numbers and letters separated by a colon.',
          botInfo: null
        };
      }

      // Create a temporary bot instance to test the token
      const testBot = new Telegraf(token);
      
      try {
        // Try to get bot information using the token
        const botInfo = await testBot.telegram.getMe();
        
        const result = {
          isValid: true,
          botInfo: {
            id: botInfo.id,
            username: botInfo.username,
            firstName: botInfo.first_name,
            canJoinGroups: botInfo.can_join_groups,
            canReadAllGroupMessages: botInfo.can_read_all_group_messages,
            supportsInlineQueries: botInfo.supports_inline_queries
          },
          error: null
        };

        // Cache the result
        this.validationCache.set(token, {
          result,
          timestamp: Date.now()
        });

        return result;

      } catch (apiError) {
        // Handle "Bot is not running!" error more leniently
        if (apiError.message && apiError.message.includes('Bot is not running')) {
          // Try to get bot info without starting the bot
          try {
            const botInfo = await testBot.telegram.getMe();
            
            const result = {
              isValid: true,
              botInfo: {
                id: botInfo.id,
                username: botInfo.username,
                firstName: botInfo.first_name,
                canJoinGroups: botInfo.can_join_groups,
                canReadAllGroupMessages: botInfo.can_read_all_group_messages,
                supportsInlineQueries: botInfo.supports_inline_queries
              },
              error: null,
              warning: 'Bot is not currently running, but token is valid'
            };

            // Cache the result
            this.validationCache.set(token, {
              result,
              timestamp: Date.now()
            });

            return result;
          } catch (getMeError) {
            // If getMe also fails, return the original error
            return {
              isValid: false,
              error: `Bot validation failed: ${getMeError.message}`,
              botInfo: null
            };
          }
        } else {
          // For other errors, return the original error
          throw apiError;
        }
      } finally {
        // Always try to stop the test bot
        try {
          await testBot.stop();
        } catch (stopError) {
          // Ignore stop errors
        }
      }

    } catch (error) {
      console.error('Token validation error:', error);
      
      let errorMessage = 'Unknown error occurred during validation.';
      
      if (error.code === 401) {
        errorMessage = 'Invalid token. The token you provided is not valid.';
      } else if (error.code === 403) {
        errorMessage = 'Token is valid but the bot is blocked or deleted.';
      } else if (error.code === 404) {
        errorMessage = 'Bot not found. The token might be invalid or the bot was deleted.';
      } else if (error.code === 429) {
        errorMessage = 'Too many requests. Please try again in a few minutes.';
      } else if (error.code === 500) {
        errorMessage = 'Telegram server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        isValid: false,
        error: errorMessage,
        botInfo: null
      };
    }
  }

  /**
   * Check if token format is valid
   * @param {string} token - The token to check
   * @returns {boolean} - Whether the format is valid
   */
  isValidTokenFormat(token) {
    // Telegram bot tokens have format: <bot_id>:<bot_token>
    // Example: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
    const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
    return tokenRegex.test(token);
  }

  /**
   * Clear the validation cache
   */
  clearCache() {
    this.validationCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    return {
      size: this.validationCache.size,
      entries: Array.from(this.validationCache.keys())
    };
  }
}

// Create singleton instance
const tokenValidator = new TokenValidator();

module.exports = tokenValidator; 