const { Markup } = require('telegraf');

module.exports = {
  // Welcome keyboard for guests/new users
  welcomeKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('🚀 Start Demo', 'start_demo'),
      Markup.button.callback('📋 GameList', 'gamelist')
    ],
    [
      Markup.button.callback('🖼️ Gallery', 'gallery'),
      Markup.button.callback('❓ Help', 'help')
    ],
  ]).reply_markup,

  // Super Admin keyboard
  superAdminKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('👥 Manage Agents', 'manage_agents'),
      Markup.button.callback('📊 System Stats', 'system_stats')
    ],
    [
      Markup.button.callback('🔧 System Settings', 'system_settings'),
      Markup.button.callback('📤 Broadcast', 'broadcast_message')
    ],
    [
      Markup.button.callback('🚀 Demo', 'start_demo'),
      Markup.button.callback('🖼️ Gallery', 'gallery')
    ],
    [
      Markup.button.callback('❓ Help', 'help'),
      Markup.button.callback('🏠 Main Menu', 'back_to_main')
    ]
  ]).reply_markup,

  // Agent keyboard
  agentKeyboard: (agentName) => Markup.inlineKeyboard([
    [
      Markup.button.callback(`👥 Manage ${agentName} Members`, 'manage_members'),
      Markup.button.callback('📊 Agent Stats', 'agent_stats')
    ],
    [
      Markup.button.callback('⚙️ Agent Settings', 'agent_settings'),
      Markup.button.callback('📤 Send Message', 'send_to_members')
    ],
    [
      Markup.button.callback('🎮 Games', 'games'),
      Markup.button.callback('🖼️ Gallery', 'gallery')
    ],
    [
      Markup.button.callback('❓ Help', 'help'),
      Markup.button.callback('🏠 Main Menu', 'back_to_main')
    ]
  ]).reply_markup,

  // Member keyboard
  memberKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('🎮 Play Games', 'play_games'),
      Markup.button.callback('📊 My Stats', 'my_stats')
    ],
    [
      Markup.button.callback('🖼️ Gallery', 'gallery'),
      Markup.button.callback('🎲 Quick Games', 'quick_games')
    ],
    [
      Markup.button.callback('⚙️ Settings', 'member_settings'),
      Markup.button.callback('❓ Help', 'help')
    ],
    [
      Markup.button.callback('🏠 Main Menu', 'back_to_main')
    ]
  ]).reply_markup,

  // Help keyboard (role-based)
  helpKeyboard: (role = 'guest') => {
    const baseButtons = [
      [
        Markup.button.callback('🚀 Demo', 'start_demo'),
        Markup.button.callback('🖼️ Gallery', 'gallery')
      ]
    ];

    if (role === 'super_admin') {
      baseButtons.unshift([
        Markup.button.callback('👥 Manage Agents', 'manage_agents'),
        Markup.button.callback('📊 System Stats', 'system_stats')
      ]);
    } else if (role === 'agent') {
      baseButtons.unshift([
        Markup.button.callback('👥 Manage Members', 'manage_members'),
        Markup.button.callback('📊 Agent Stats', 'agent_stats')
      ]);
    } else if (role === 'member') {
      baseButtons.unshift([
        Markup.button.callback('🎮 Play Games', 'play_games'),
        Markup.button.callback('📊 My Stats', 'my_stats')
      ]);
    }

    baseButtons.push([
      Markup.button.callback('🏠 Back to Main', 'back_to_main')
    ]);

    return Markup.inlineKeyboard(baseButtons).reply_markup;
  },

  // Demo keyboard
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

  // Agent management keyboard
  agentManagementKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('➕ Add Agent', 'add_agent'),
      Markup.button.callback('📝 Edit Agent', 'edit_agent')
    ],
    [
      Markup.button.callback('❌ Remove Agent', 'remove_agent'),
      Markup.button.callback('📊 View All Agents', 'view_agents')
    ],
    [
      Markup.button.callback('🏠 Back to Admin', 'back_to_admin')
    ]
  ]).reply_markup,

  // Member management keyboard
  memberManagementKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('➕ Add Member', 'add_member'),
      Markup.button.callback('📝 Edit Member', 'edit_member')
    ],
    [
      Markup.button.callback('❌ Remove Member', 'remove_member'),
      Markup.button.callback('📊 View All Members', 'view_members')
    ],
    [
      Markup.button.callback('🏠 Back to Agent', 'back_to_agent')
    ]
  ]).reply_markup,

  // Games keyboard
  gamesKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('🎲 Dice Roll', 'dice_roll'),
      Markup.button.callback('🪙 Coin Flip', 'coin_flip')
    ],
    [
      Markup.button.callback('🔢 Number Game', 'number_game'),
      Markup.button.callback('❓ Quiz', 'quiz_game')
    ],
    [
      Markup.button.callback('🏆 Leaderboard', 'leaderboard'),
      Markup.button.callback('📊 Game Stats', 'game_stats')
    ],
    [
      Markup.button.callback('🏠 Back to Main', 'back_to_main')
    ]
  ]).reply_markup,

  // Settings keyboard
  settingsKeyboard: (role = 'guest') => {
    const baseButtons = [
      [
        Markup.button.callback('🔔 Notifications', 'toggle_notifications'),
        Markup.button.callback('🌅 Good Morning', 'toggle_good_morning')
      ]
    ];

    if (role === 'super_admin') {
      baseButtons.unshift([
        Markup.button.callback('🔧 System Config', 'system_config'),
        Markup.button.callback('👤 User Management', 'user_management')
      ]);
    } else if (role === 'agent') {
      baseButtons.unshift([
        Markup.button.callback('🔧 Agent Config', 'agent_config'),
        Markup.button.callback('👥 Member Settings', 'member_settings')
      ]);
    }

    baseButtons.push([
      Markup.button.callback('🏠 Back to Main', 'back_to_main')
    ]);

    return Markup.inlineKeyboard(baseButtons).reply_markup;
  },

  // Confirmation keyboard
  confirmationKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Yes', 'confirm_yes'),
      Markup.button.callback('❌ No', 'confirm_no')
    ]
  ]).reply_markup,

  // Navigation keyboard
  navigationKeyboard: () => Markup.inlineKeyboard([
    [
      Markup.button.callback('⬅️ Previous', 'nav_previous'),
      Markup.button.callback('➡️ Next', 'nav_next')
    ],
    [
      Markup.button.callback('🏠 Back to Main', 'back_to_main')
    ]
  ]).reply_markup
}; 