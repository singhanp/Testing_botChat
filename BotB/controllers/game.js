const buttons = require('../services/buttons');
const gameListAPI = require('../api/gamelistapi');

async function handleGameMenu(ctx) {
  try {
    const gameMessage = `🎮 **Game Center**\n\nWelcome to our Game Center! Choose from the options below:`;
    
    await ctx.editMessageText(gameMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Game List', callback_data: 'game_list_page_1' },
            { text: '🎲 Quick Play', callback_data: 'quick_play' }
          ],
          [
            { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
            { text: '📊 Game Stats', callback_data: 'game_stats' }
          ],
          [
            { text: '🏠 Back to Main', callback_data: 'back_to_main' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    console.error('❌ Error in handleGameMenu:', error.message);
    await ctx.reply('❌ Error loading game menu. Please try again later.');
  }
}

async function handleGameList(ctx, page = 1) {
  try {
    console.log('🔄 Fetching games from database...');
    const allGames = await gameListAPI.getGames();
    
    if (!allGames || allGames.length === 0) {
      await ctx.editMessageText('❌ *No games available*\n\nSorry, no games are currently available. Please try again later.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Game Menu', callback_data: 'game_menu' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      return;
    }

    const gamesPerPage = 4;
    const totalPages = Math.ceil(allGames.length / gamesPerPage);
    const startIndex = (page - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesOnPage = allGames.slice(startIndex, endIndex);

    const intro = `🎮 *Game List* (Page ${page}/${totalPages})\n\nChoose a game to play from the list below:`;
    
    const gameButtons = [];
    
    // Add game buttons - 2 games per row (using callback data instead of URLs)
    for (let i = 0; i < gamesOnPage.length; i += 2) {
      const row = [];
      for (let j = i; j < i + 2 && j < gamesOnPage.length; j++) {
        row.push({ 
          text: `${gamesOnPage[j].emoji} ${gamesOnPage[j].name}`, 
          callback_data: `game_detail_${gamesOnPage[j].id}`
        });
      }
      gameButtons.push(row);
    }
    
    // Add pagination buttons if needed
    if (totalPages > 1) {
      const paginationRow = [];
      
      if (page > 1) {
        paginationRow.push({ text: '⬅️ Previous', callback_data: `game_list_page_${page - 1}` });
      }
      
      if (page < totalPages) {
        paginationRow.push({ text: '➡️ Next', callback_data: `game_list_page_${page + 1}` });
      }
      
      if (paginationRow.length > 0) {
        gameButtons.push(paginationRow);
      }
      
      // Add page indicator
      gameButtons.push([{ text: `📄 ${page}/${totalPages}`, callback_data: 'page_info' }]);
    }
    
    // Add navigation buttons
    gameButtons.push([
      { text: '🔙 Back to Game Menu', callback_data: 'game_menu' },
      { text: '🏠 Main Menu', callback_data: 'back_to_main' }
    ]);
    
    await ctx.editMessageText(intro, {
      reply_markup: {
        inline_keyboard: gameButtons
      },
      parse_mode: 'Markdown'
    });
    
    console.log(`✅ Successfully displayed ${gamesOnPage.length} games on page ${page}/${totalPages}`);
    
  } catch (error) {
    console.error('❌ Error in handleGameList:', error.message);
    
    await ctx.editMessageText(
      '❌ *Error Loading Games*\n\nSorry, there was an error loading the games. Please try again later.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Game Menu', callback_data: 'game_menu' }],
            [{ text: '🏠 Main Menu', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
  }
}

async function handleQuickPlay(ctx) {
  try {
    const allGames = await gameListAPI.getGames();
    
    if (!allGames || allGames.length === 0) {
      await ctx.editMessageText('❌ *No games available*\n\nSorry, no games are currently available for quick play.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Game Menu', callback_data: 'game_menu' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      return;
    }

    // Select a random game for quick play
    const randomGame = allGames[Math.floor(Math.random() * allGames.length)];
    
    const quickPlayMessage = `🎲 *Quick Play*\n\nHere's a random game for you to try:\n\n${randomGame.emoji} **${randomGame.name}**\n\nClick the button below to start playing!`;
    
    await ctx.editMessageText(quickPlayMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: `🚀 Play ${randomGame.name}`, url: randomGame.url }
          ],
          [
            { text: '🎲 Another Random Game', callback_data: 'quick_play' },
            { text: '📋 View All Games', callback_data: 'game_list_page_1' }
          ],
          [
            { text: '🔙 Back to Game Menu', callback_data: 'game_menu' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    console.error('❌ Error in handleQuickPlay:', error.message);
    await ctx.editMessageText('❌ Error loading quick play. Please try again later.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Game Menu', callback_data: 'game_menu' }]
        ]
      }
    });
  }
}

async function handleGameDetail(ctx, gameId) {
  try {
    console.log(`🔄 Fetching game details for ID: ${gameId}`);
    const game = await gameListAPI.getGameById(gameId);
    
    if (!game) {
      await ctx.editMessageText('❌ *Game Not Found*\n\nSorry, this game is no longer available.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Game List', callback_data: 'game_list_page_1' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      return;
    }

    // Get game details with logo
    const allGames = await gameListAPI.getGames();
    const gameWithDetails = allGames.find(g => g.id.toString() === gameId.toString());
    
    if (!gameWithDetails) {
      await ctx.editMessageText('❌ *Game Details Not Available*', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Game List', callback_data: 'game_list_page_1' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      return;
    }

    const gameDetailMessage = `🎮 *${gameWithDetails.name}*\n\n${gameWithDetails.description}\n\nReady to play? Click the button below to launch the game!`;
    
    // Send photo with game details
    await ctx.replyWithPhoto(gameWithDetails.logo, {
      caption: gameDetailMessage,
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: '🚀 Play Now', 
              web_app: { url: gameWithDetails.miniAppUrl }
            }
          ],
          [
            { text: '🔙 Back to Game List', callback_data: 'game_list_page_1' },
            { text: '🏠 Main Menu', callback_data: 'back_to_main' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    });
    
    console.log(`✅ Successfully displayed game details for: ${gameWithDetails.name}`);
    
  } catch (error) {
    console.error('❌ Error in handleGameDetail:', error.message);
    
    await ctx.editMessageText('❌ *Error Loading Game Details*\n\nSorry, there was an error loading the game details. Please try again later.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Game List', callback_data: 'game_list_page_1' }],
          [{ text: '🏠 Main Menu', callback_data: 'back_to_main' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  }
}

module.exports = {
  handleGameMenu,
  handleGameList,
  handleQuickPlay,
  handleGameDetail
};