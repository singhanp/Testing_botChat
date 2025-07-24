const buttons = require('../services/buttons');



async function handleMenu(ctx) {
// Define a static list of games
const games = [
    { name: 'Dice Roll', emoji: '🎲', data: 'game_dice', url: 'https://www.youtube.com/' },
    { name: 'Coin Flip', emoji: '🪙', data: 'game_coin', url: 'https://www.youtube.com/' },
    { name: 'Number Game', emoji: '🔢', data: 'game_number', url: 'https://www.youtube.com/' },
    { name: 'Quiz', emoji: '❓', data: 'game_quiz', url: 'https://www.youtube.com/' }
  ];

  const intro = `🎮 *Game Menu*\n\nWelcome! Here are some fun games you can play. Select a game below to get started!`;
  // Create buttons for each game with URL
  const gameButtons = games.map(game => [{ text: `${game.emoji} ${game.name}`, url: game.url }]);
  // Add a back button (callback)
  gameButtons.push([{ text: '🏠 Back to Main', callback_data: 'back_to_main' }]);
  await ctx.replyWithMarkdown(intro, {
    reply_markup: {
      inline_keyboard: gameButtons
    }
  });
}

module.exports = (bot) => {
  bot.command('menu', handleMenu);
};

module.exports.handleMenu = handleMenu;
