const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

// Bot Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Store user data temporarily
const userData = {};

// Start command
bot.start(async (ctx) => {
  const welcomeMessage = `🤖 Welcome to Interactive Bot!

Hi ${ctx.from.first_name}! I'm your interactive Telegram bot.

🔹 I can send you images
🔹 I can show interactive buttons
🔹 I can respond to your choices
🔹 I can send you different types of content

Try these commands:
/help - Show all available commands
/demo - See a demo with images and buttons
/gallery - Browse image gallery
/menu - Interactive menu with options
/contact - Contact information`;

  await ctx.reply(welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 Start Demo', callback_data: 'start_demo' },
          { text: '📋 Show Menu', callback_data: 'show_menu' }
        ],
        [
          { text: '🖼️ Gallery', callback_data: 'gallery' },
          { text: '❓ Help', callback_data: 'help' }
        ]
      ]
    }
  });
});

// Help command
bot.help(async (ctx) => {
  const helpMessage = `📚 Available Commands:

🔸 /start - Welcome message with options
🔸 /demo - Interactive demo with images and buttons
🔸 /gallery - Browse beautiful images
🔸 /menu - Show interactive menu
🔸 /contact - Get contact information
🔸 /weather - Weather information (demo)
🔸 /quote - Get an inspirational quote
🔸 /games - Fun games menu
🔸 /settings - Bot settings

💡 You can also click on the buttons below for quick access!`;

  await ctx.reply(helpMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 Demo', callback_data: 'start_demo' },
          { text: '🖼️ Gallery', callback_data: 'gallery' }
        ],
        [
          { text: '🎮 Games', callback_data: 'games' },
          { text: '⚙️ Settings', callback_data: 'settings' }
        ],
        [
          { text: '🏠 Back to Main', callback_data: 'back_to_main' }
        ]
      ]
    }
  });
});

// Demo command with image and buttons
bot.command('demo', async (ctx) => {
  try {
    // Send an image with caption and buttons
    await ctx.replyWithPhoto(
      { url: 'https://picsum.photos/800/600?random=1' },
      {
        caption: `🌟 Interactive Demo

This is a sample image with interactive buttons below. 
Click on any button to see how the bot responds!

📸 Image source: Lorem Picsum (random image)`,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👍 Like', callback_data: 'like_image' },
              { text: '💬 Comment', callback_data: 'comment_image' },
              { text: '📤 Share', callback_data: 'share_image' }
            ],
            [
              { text: '🔄 New Image', callback_data: 'new_image' },
              { text: '📊 Stats', callback_data: 'image_stats' }
            ],
            [
              { text: '🏠 Main Menu', callback_data: 'back_to_main' }
            ]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Error sending image:', error);
    await ctx.reply('Sorry, there was an error loading the image. Let me show you the demo without image:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👍 Like', callback_data: 'like_image' },
            { text: '💬 Comment', callback_data: 'comment_image' }
          ],
          [
            { text: '🔄 Try Again', callback_data: 'start_demo' }
          ]
        ]
      }
    });
  }
});

// Gallery command
bot.command('gallery', async (ctx) => {
  const galleries = [
    { name: 'Nature', emoji: '🌿', data: 'gallery_nature' },
    { name: 'Cities', emoji: '🏙️', data: 'gallery_cities' },
    { name: 'Space', emoji: '🌌', data: 'gallery_space' },
    { name: 'Animals', emoji: '🐾', data: 'gallery_animals' }
  ];

  await ctx.reply('🖼️ Choose a gallery to explore:', {
    reply_markup: {
      inline_keyboard: [
        galleries.slice(0, 2).map(g => ({ text: `${g.emoji} ${g.name}`, callback_data: g.data })),
        galleries.slice(2, 4).map(g => ({ text: `${g.emoji} ${g.name}`, callback_data: g.data })),
        [{ text: '🏠 Back to Main', callback_data: 'back_to_main' }]
      ]
    }
  });
});

// Menu command
bot.command('menu', async (ctx) => {
  await ctx.reply('🍽️ Interactive Menu - Choose an option:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '☀️ Weather', callback_data: 'weather' },
          { text: '💭 Quote', callback_data: 'quote' }
        ],
        [
          { text: '🎮 Games', callback_data: 'games' },
          { text: '📰 News', callback_data: 'news' }
        ],
        [
          { text: '🎵 Music', callback_data: 'music' },
          { text: '🍔 Food', callback_data: 'food' }
        ],
        [
          { text: '⚙️ Settings', callback_data: 'settings' },
          { text: '🏠 Main Menu', callback_data: 'back_to_main' }
        ]
      ]
    }
  });
});

// Contact command
bot.command('contact', async (ctx) => {
  await ctx.reply('📞 Contact Information\n\n👤 Admin ID: ' + ADMIN_ID + '\n\n📧 For support, you can contact the bot administrator.', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📱 Send Message to Admin', callback_data: 'contact_admin' },
          { text: '🆘 Report Issue', callback_data: 'report_issue' }
        ],
        [
          { text: '🏠 Back to Main', callback_data: 'back_to_main' }
        ]
      ]
    }
  });
});

// Quote command
bot.command('quote', async (ctx) => {
  const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  await ctx.reply(`💭 Inspirational Quote:\n\n"${randomQuote}"`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔄 New Quote', callback_data: 'quote' },
          { text: '💾 Save Quote', callback_data: 'save_quote' }
        ],
        [
          { text: '🏠 Back to Main', callback_data: 'back_to_main' }
        ]
      ]
    }
  });
});

// Games command
bot.command('games', async (ctx) => {
  await ctx.reply('🎮 Fun Games & Activities:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🎲 Roll Dice', callback_data: 'roll_dice' },
          { text: '🪙 Flip Coin', callback_data: 'flip_coin' }
        ],
        [
          { text: '🔢 Number Game', callback_data: 'number_game' },
          { text: '❓ Quiz', callback_data: 'quiz' }
        ],
        [
          { text: '🎯 Random Choice', callback_data: 'random_choice' },
          { text: '🏠 Back to Main', callback_data: 'back_to_main' }
        ]
      ]
    }
  });
});

// Handle callback queries (button clicks)
bot.on('callback_query', async (ctx) => {
  const action = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  // Answer the callback query to remove loading state
  await ctx.answerCbQuery();

  switch (action) {
    case 'start_demo':
      await ctx.editMessageText('🚀 Starting interactive demo...', {
        reply_markup: {
          inline_keyboard: [[{ text: '⏳ Loading...', callback_data: 'loading' }]]
        }
      });
      
      setTimeout(async () => {
        try {
          await ctx.editMessageText('🌟 Demo Complete! Here\'s your interactive content:');
          await ctx.replyWithPhoto(
            { url: 'https://picsum.photos/800/600?random=2' },
            {
              caption: '✨ This is an interactive demo image!\n\nTry clicking the buttons below:',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '❤️ Love it!', callback_data: 'love_it' },
                    { text: '👏 Amazing!', callback_data: 'amazing' }
                  ],
                  [
                    { text: '🔄 Another Image', callback_data: 'another_image' },
                    { text: '🏠 Main Menu', callback_data: 'back_to_main' }
                  ]
                ]
              }
            }
          );
        } catch (error) {
          await ctx.reply('Demo ready! (Image unavailable)', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Try Again', callback_data: 'start_demo' }]
              ]
            }
          });
        }
      }, 2000);
      break;

    case 'show_menu':
    case 'back_to_main':
      await ctx.editMessageText('🏠 Main Menu - Choose an option:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🚀 Demo', callback_data: 'start_demo' },
              { text: '🖼️ Gallery', callback_data: 'gallery' }
            ],
            [
              { text: '🎮 Games', callback_data: 'games' },
              { text: '💭 Quote', callback_data: 'quote' }
            ],
            [
              { text: '☀️ Weather', callback_data: 'weather' },
              { text: '⚙️ Settings', callback_data: 'settings' }
            ]
          ]
        }
      });
      break;

    case 'gallery':
      await ctx.editMessageText('🖼️ Choose a gallery:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌿 Nature', callback_data: 'gallery_nature' },
              { text: '🏙️ Cities', callback_data: 'gallery_cities' }
            ],
            [
              { text: '🌌 Space', callback_data: 'gallery_space' },
              { text: '🐾 Animals', callback_data: 'gallery_animals' }
            ],
            [
              { text: '🏠 Back to Main', callback_data: 'back_to_main' }
            ]
          ]
        }
      });
      break;

    case 'gallery_nature':
      await ctx.editMessageText('🌿 Loading nature gallery...');
      setTimeout(async () => {
        try {
          await ctx.replyWithPhoto(
            { url: 'https://picsum.photos/800/600?nature' },
            {
              caption: '🌿 Beautiful Nature\n\nEnjoy this peaceful nature scene!',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🔄 Next Nature', callback_data: 'gallery_nature' },
                    { text: '🖼️ Other Galleries', callback_data: 'gallery' }
                  ]
                ]
              }
            }
          );
        } catch {
          await ctx.reply('🌿 Nature Gallery\n\n🌲 Beautiful forests and landscapes await!');
        }
      }, 1000);
      break;

    case 'gallery_cities':
      await ctx.editMessageText('🏙️ Loading cities gallery...');
      setTimeout(async () => {
        try {
          await ctx.replyWithPhoto(
            { url: 'https://picsum.photos/800/600?city' },
            {
              caption: '🏙️ Urban Landscapes\n\nExplore amazing cityscapes!',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🔄 Next City', callback_data: 'gallery_cities' },
                    { text: '🖼️ Other Galleries', callback_data: 'gallery' }
                  ]
                ]
              }
            }
          );
        } catch {
          await ctx.reply('🏙️ Cities Gallery\n\n🌆 Amazing urban landscapes and architecture!');
        }
      }, 1000);
      break;

    case 'games':
      await ctx.editMessageText('🎮 Choose a game:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎲 Roll Dice', callback_data: 'roll_dice' },
              { text: '🪙 Flip Coin', callback_data: 'flip_coin' }
            ],
            [
              { text: '🔢 Number Game', callback_data: 'number_game' },
              { text: '❓ Quiz', callback_data: 'quiz' }
            ],
            [
              { text: '🏠 Back to Main', callback_data: 'back_to_main' }
            ]
          ]
        }
      });
      break;

    case 'roll_dice':
      const diceResult = Math.floor(Math.random() * 6) + 1;
      await ctx.editMessageText(`🎲 Dice Roll Result: ${diceResult}!`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎲 Roll Again', callback_data: 'roll_dice' },
              { text: '🎮 Other Games', callback_data: 'games' }
            ]
          ]
        }
      });
      break;

    case 'flip_coin':
      const coinResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
      await ctx.editMessageText(`🪙 Coin Flip Result: ${coinResult}!`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🪙 Flip Again', callback_data: 'flip_coin' },
              { text: '🎮 Other Games', callback_data: 'games' }
            ]
          ]
        }
      });
      break;

    case 'quote':
      const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Stay hungry, stay foolish. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      await ctx.editMessageText(`💭 ${randomQuote}`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 New Quote', callback_data: 'quote' },
              { text: '🏠 Main Menu', callback_data: 'back_to_main' }
            ]
          ]
        }
      });
      break;

    case 'weather':
      await ctx.editMessageText('☀️ Weather Information\n\n🌡️ Temperature: 22°C\n🌤️ Condition: Partly Cloudy\n💨 Wind: 5 km/h\n💧 Humidity: 65%', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 Refresh', callback_data: 'weather' },
              { text: '📍 Change Location', callback_data: 'change_location' }
            ],
            [
              { text: '🏠 Main Menu', callback_data: 'back_to_main' }
            ]
          ]
        }
      });
      break;

    case 'settings':
      await ctx.editMessageText('⚙️ Bot Settings:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔔 Notifications', callback_data: 'notifications' },
              { text: '🌐 Language', callback_data: 'language' }
            ],
            [
              { text: '🎨 Theme', callback_data: 'theme' },
              { text: '🔒 Privacy', callback_data: 'privacy' }
            ],
            [
              { text: '🏠 Back to Main', callback_data: 'back_to_main' }
            ]
          ]
        }
      });
      break;

    case 'like_image':
      await ctx.editMessageText('👍 You liked this image! Thank you for your feedback.', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 New Image', callback_data: 'start_demo' },
              { text: '🏠 Main Menu', callback_data: 'back_to_main' }
            ]
          ]
        }
      });
      break;

    case 'love_it':
      await ctx.answerCbQuery('❤️ Glad you love it!', { show_alert: true });
      break;

    case 'amazing':
      await ctx.answerCbQuery('👏 Thank you! That means a lot!', { show_alert: true });
      break;

    default:
      await ctx.answerCbQuery('🔧 Feature coming soon!');
      break;
  }
});

// Handle text messages
bot.on('text', async (ctx) => {
  const message = ctx.message.text.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi')) {
    await ctx.reply('👋 Hello! How can I help you today?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🚀 Show Demo', callback_data: 'start_demo' },
            { text: '📋 Help', callback_data: 'help' }
          ]
        ]
      }
    });
  } else if (message.includes('image') || message.includes('photo')) {
    try {
      await ctx.replyWithPhoto(
        { url: 'https://picsum.photos/800/600?random=3' },
        {
          caption: 'Here\'s a random image for you! 📸',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 Another Image', callback_data: 'start_demo' },
                { text: '🖼️ Gallery', callback_data: 'gallery' }
              ]
            ]
          }
        }
      );
    } catch {
      await ctx.reply('🖼️ Sorry, couldn\'t load image right now. Try /demo command!');
    }
  } else {
    await ctx.reply(`🤖 You said: "${ctx.message.text}"\n\nTry these commands:\n/start - Main menu\n/demo - Interactive demo\n/help - All commands`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🏠 Main Menu', callback_data: 'back_to_main' }
          ]
        ]
      }
    });
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('🚨 An error occurred. Please try again or contact support.');
});

// Start the bot
console.log('🤖 Starting Interactive Telegram Bot...');
bot.launch()
  .then(() => {
    console.log('✅ Bot is running successfully!');
    console.log('🔗 Bot Token:', BOT_TOKEN.substring(0, 10) + '...');
    console.log('👤 Admin ID:', ADMIN_ID);
    console.log('\n🎯 Available features:');
    console.log('  📷 Image sending');
    console.log('  🔘 Interactive buttons');
    console.log('  📋 Multiple menus');
    console.log('  🎮 Games and activities');
    console.log('  💬 Text responses');
  })
  .catch((error) => {
    console.error('❌ Failed to start bot:', error);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop('SIGTERM');
}); 