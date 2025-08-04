// Inline keyboard example
function getInlineKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Button 1', callback_data: 'btn1' }],
        [{ text: 'Button 2', callback_data: 'btn2' }]
      ]
    }
  };
}

// Reply keyboard example
function getReplyKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: 'Option 1' }, { text: 'Option 2' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

module.exports = {
  getInlineKeyboard,
  getReplyKeyboard
};