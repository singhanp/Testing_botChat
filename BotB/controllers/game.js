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
    
    // Add game buttons - 2 games per row
    for (let i = 0; i < gamesOnPage.length; i += 2) {
      const row = [];
      for (let j = i; j < i + 2 && j < gamesOnPage.length; j++) {
        row.push({ 
          text: `${gamesOnPage[j].emoji} ${gamesOnPage[j].name}`, 
          url: gamesOnPage[j].url 
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

module.exports = {
  handleGameMenu,
  handleGameList,
  handleQuickPlay
};