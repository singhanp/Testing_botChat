const buttons = require('../services/buttons');
const gameListAPI = require('../api/gamelistapi');

async function handleMenu(ctx) {
  try {
    // Fetch games from database instead of using static data
    console.log('🔄 Fetching games from database...');
    const games = await gameListAPI.getGames();
    
    if (!games || games.length === 0) {
      await ctx.replyWithMarkdown('❌ *No games available*\n\nSorry, no games are currently available. Please try again later.');
      return;
    }

    const intro = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
    
    // Arrange buttons two per row
    const gameButtons = [];
    for (let i = 0; i < games.length; i += 2) {
      const row = [];
      for (let j = i; j < i + 2 && j < games.length; j++) {
        row.push({ 
          text: games[j].name, 
          url: games[j].url 
        });
      }
      gameButtons.push(row);
    }
    
    // Add a back button (callback)
    gameButtons.push([{ text: 'Back to Main', callback_data: 'back_to_main' }]);
    
    await ctx.replyWithMarkdown(intro, {
      reply_markup: {
        inline_keyboard: gameButtons
      }
    });
    
    console.log(`✅ Successfully displayed ${games.length} games to user`);
    
  } catch (error) {
    console.error('❌ Error in handleMenu:', error.message);
    
    // Fallback to show error message
    await ctx.replyWithMarkdown(
      '❌ *Error Loading Games*\n\nSorry, there was an error loading the games. Please try again later.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Back to Main', callback_data: 'back_to_main' }]]
        }
      }
    );
  }
}

module.exports = (bot) => {
  bot.command('menu', handleMenu);
};

module.exports.handleMenu = handleMenu;
