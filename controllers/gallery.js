const buttons = require('../services/buttons');

async function handleGallery(ctx) {
  const galleries = [
    { name: 'Nature', emoji: '🌿', data: 'gallery_nature', url: 'https://www.google.com/' },
    { name: 'Cities', emoji: '🏙️', data: 'gallery_cities', url: 'https://www.google.com/' },
    { name: 'Space', emoji: '🌌', data: 'gallery_space', url: 'https://www.google.com/' },
    { name: 'Animals', emoji: '🐾', data: 'gallery_animals', url: 'https://www.google.com/' }
  ];

  await ctx.reply('🖼️ Choose a gallery to explore:', {
    reply_markup: {
      inline_keyboard: [
        galleries.slice(0, 2).map(g => ({ text: `${g.emoji} ${g.name}`, callback_data: g.data, url: g.url })),
        galleries.slice(2, 4).map(g => ({ text: `${g.emoji} ${g.name}`, callback_data: g.data, url: g.url })),
        [{ text: '🏠 Back to Main', callback_data: 'back_to_main' }]
      ]
    }
  });
}

module.exports = (bot) => {
  bot.command('gallery', handleGallery);
};

module.exports.handleGallery = handleGallery;
