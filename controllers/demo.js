const buttons = require('../services/buttons');

async function handleDemo(ctx) {
  try {
    await ctx.replyWithPhoto(
      { url: 'https://picsum.photos/800/600?random=1' },
      {
        caption: `🌟 Interactive Demo\n\nThis is a sample image with interactive buttons below. \nClick on any button to see how the bot responds!\n\n📸 Image source: Lorem Picsum (random image)`,
        reply_markup: buttons.demoKeyboard()
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
}

module.exports = (bot) => {
  bot.command('demo', handleDemo);
};

module.exports.handleDemo = handleDemo;
