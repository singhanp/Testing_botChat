const buttons = require('../services/buttons');

async function handleGallery(ctx) {
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
}

module.exports = (bot) => {
  bot.command('gallery', handleGallery);
};

module.exports.handleGallery = handleGallery;
