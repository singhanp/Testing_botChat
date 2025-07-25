const { Markup } = require('telegraf');

module.exports = {
  welcomeKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('🚀 Start Demo', 'start_demo'),
      Markup.button.callback('📋 Show Menu', 'show_menu')
    ],
    [
      Markup.button.callback('🖼️ Gallery', 'gallery'),
      Markup.button.callback('❓ Help', 'help')
    ],
    [
      Markup.button.callback('⚙️ Login', 'login'),
    ],
  ]).reply_markup,
  helpKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('🚀 Demo', 'start_demo'),
      Markup.button.callback('🖼️ Gallery', 'gallery')
    ],
    [
      Markup.button.callback('🎮 Games', 'games'),
      Markup.button.callback('⚙️ Settings', 'settings')
    ],
    [
      Markup.button.callback('🏠 Back to Main', 'back_to_main')
    ]
  ]).reply_markup,
  demoKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('👍 Like', 'like_image'),
      Markup.button.callback('💬 Comment', 'comment_image'),
      Markup.button.callback('📤 Share', 'share_image')
    ],
    [
      Markup.button.callback('🔄 New Image', 'new_image'),
      Markup.button.callback('📊 Stats', 'image_stats')
    ],
    [
      Markup.button.callback('🏠 Main Menu', 'back_to_main')
    ]
  ]).reply_markup,
  // Add other keyboards as needed...
}; 