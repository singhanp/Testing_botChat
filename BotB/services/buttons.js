const { Markup } = require('telegraf');

module.exports = {
  // Welcome keyboard for guests/new users
  welcomeKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('Play Games', 'game_menu'),
      Markup.button.callback('Check Balance', 'check_balance')
    ],
    [
      Markup.button.callback('Deposit', 'deposit'),
      Markup.button.callback('Withdraw', 'withdraw')
    ],
    [
      Markup.button.callback('Logout', 'logout')
    ]
  ]).reply_markup,

  // Game category selection keyboard
  gameCategoryKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('My Favourite', 'my_favourite'),
      Markup.button.callback('Popular Games', 'popular_games')
    ],
    [
      Markup.button.callback('Pragmatic Slot', 'pragmatic_slot')
    ],
    [
      Markup.button.callback('Back To Menu', 'back_to_main')
    ]
  ]).reply_markup,

  // Navigation keyboard
  navigationKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('Previous', 'nav_previous'),
      Markup.button.callback('Next', 'nav_next')
    ],
    [
      Markup.button.callback('Back to Main', 'back_to_main')
    ]
  ]).reply_markup
}; 