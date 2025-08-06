const buttons = require('../services/buttons');
const gameListAPI = require('../api/gamelistapi');

async function handleGameList(ctx, page = 1) {
  try {
    console.log('🔄 Fetching games from database...');
    const allGames = await gameListAPI.getGames();
    
    if (!allGames || allGames.length === 0) {
      const noGamesMessage = '❌ *No games available*\n\nSorry, no games are currently available. Please try again later.';
      const noGamesKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Back to Main', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      };
      
      try {
        await ctx.editMessageText(noGamesMessage, noGamesKeyboard);
      } catch (editError) {
        // If editing fails (e.g., message is a photo), send a new message
        await ctx.reply(noGamesMessage, noGamesKeyboard);
      }
      return;
    }

    const gamesPerPage = 4;
    const totalPages = Math.ceil(allGames.length / gamesPerPage);
    const startIndex = (page - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesOnPage = allGames.slice(startIndex, endIndex);

    const intro = `Game List (Page ${page}/${totalPages})\n\nChoose a game to play from the list below:`;
    
    const gameButtons = [];
    
    // Add game buttons - 2 games per row (using callback data instead of URLs)
    for (let i = 0; i < gamesOnPage.length; i += 2) {
      const row = [];
      for (let j = i; j < i + 2 && j < gamesOnPage.length; j++) {
        row.push({ 
          text: gamesOnPage[j].name, 
          callback_data: `game_detail_${gamesOnPage[j].id}`
        });
      }
      gameButtons.push(row);
    }
    
    // Add pagination buttons if needed
    if (totalPages > 1) {
      const paginationRow = [];
      
      if (page > 1) {
        paginationRow.push({ text: 'Previous', callback_data: `game_list_page_${page - 1}` });
      }
      
      if (page < totalPages) {
        paginationRow.push({ text: 'Next', callback_data: `game_list_page_${page + 1}` });
      }
      
      if (paginationRow.length > 0) {
        gameButtons.push(paginationRow);
      }
      
      // Add page indicator
      gameButtons.push([{ text: `Page ${page}/${totalPages}`, callback_data: 'page_info' }]);
    }
    
    // Add navigation buttons
    gameButtons.push([
      { text: 'Back to Main', callback_data: 'back_to_main' }
    ]);
    
    // Try to edit the message, but if it fails (e.g., editing a photo message), send a new message
    try {
      await ctx.editMessageText(intro, {
        reply_markup: {
          inline_keyboard: gameButtons
        },
        parse_mode: 'Markdown'
      });
    } catch (editError) {
      // If editing fails (e.g., message is a photo), send a new message
      await ctx.reply(intro, {
        reply_markup: {
          inline_keyboard: gameButtons
        },
        parse_mode: 'Markdown'
      });
    }
    
    console.log(`✅ Successfully displayed ${gamesOnPage.length} games on page ${page}/${totalPages}`);
    
  } catch (error) {
    console.error('❌ Error in handleGameList:', error.message);
    
    const errorMessage = '❌ *Error Loading Games*\n\nSorry, there was an error loading the games. Please try again later.';
    const errorKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Back to Main', callback_data: 'back_to_main' }]
        ]
      },
      parse_mode: 'Markdown'
    };
    
    try {
      await ctx.editMessageText(errorMessage, errorKeyboard);
    } catch (editError) {
      // If editing fails (e.g., message is a photo), send a new message
      await ctx.reply(errorMessage, errorKeyboard);
    }
  }
}

async function handleGameDetail(ctx, gameId) {
  try {
    console.log(`🔄 Fetching game details for ID: ${gameId}`);
    const game = await gameListAPI.getGameById(gameId);
    
    if (!game) {
      const notFoundMessage = '❌ *Game Not Found*\n\nSorry, this game is no longer available.';
      const notFoundKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Back to Game List', callback_data: 'game_list_page_1' }]
          ]
        },
        parse_mode: 'Markdown'
      };
      
      try {
        await ctx.editMessageText(notFoundMessage, notFoundKeyboard);
      } catch (editError) {
        await ctx.reply(notFoundMessage, notFoundKeyboard);
      }
      return;
    }

    // Get game details with logo
    const allGames = await gameListAPI.getGames();
    const gameWithDetails = allGames.find(g => g.id.toString() === gameId.toString());
    
    if (!gameWithDetails) {
      const detailsMessage = '❌ *Game Details Not Available*';
      const detailsKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Back to Game List', callback_data: 'game_list_page_1' }]
          ]
        },
        parse_mode: 'Markdown'
      };
      
      try {
        await ctx.editMessageText(detailsMessage, detailsKeyboard);
      } catch (editError) {
        await ctx.reply(detailsMessage, detailsKeyboard);
      }
      return;
    }

    const gameDetailMessage = `*${gameWithDetails.name}*\n\n${gameWithDetails.description}\n\nReady to play? Click the button below to launch the game!`;
    
    const gameKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: 'Play Now', 
              web_app: { url: gameWithDetails.miniAppUrl }
            }
          ],
          [
            { text: 'Back to Game List', callback_data: 'game_list_page_1' },
            { text: 'Back to Main', callback_data: 'back_to_main' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    };
    
    // Try to send photo with game details, fallback to text if photo fails
    try {
      await ctx.replyWithPhoto(gameWithDetails.logo, {
        caption: gameDetailMessage,
        ...gameKeyboard
      });
    } catch (photoError) {
      console.log(`⚠️ Failed to load image for ${gameWithDetails.name}, sending text instead`);
      // If photo fails to load, send as text message instead
      await ctx.reply(gameDetailMessage, gameKeyboard);
    }
    
    console.log(`✅ Successfully displayed game details for: ${gameWithDetails.name}`);
    
  } catch (error) {
    console.error('❌ Error in handleGameDetail:', error.message);
    
    const errorMessage = '❌ *Error Loading Game Details*\n\nSorry, there was an error loading the game details. Please try again later.';
    const errorKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Back to Game List', callback_data: 'game_list_page_1' }],
          [{ text: 'Back to Main', callback_data: 'back_to_main' }]
        ]
      },
      parse_mode: 'Markdown'
    };
    
    try {
      await ctx.editMessageText(errorMessage, errorKeyboard);
    } catch (editError) {
      await ctx.reply(errorMessage, errorKeyboard);
    }
  }
}

module.exports = {
  handleGameList,
  handleGameDetail
};