# 🚀 Quick Start Guide

## ✅ Your Bot is Ready!

Your Telegram bot is configured and ready to use with the following settings:

- **Bot Token**: `8114313056:AAEFMfh-wW7xxvLMBKNb7bkooRG8NZ43mzY`
- **Your Telegram ID**: `52648427812802789`

## 🏃‍♂️ Start in 3 Steps

### 1. Install & Run
```bash
# If you haven't already:
npm install

# Start the bot
npm start
```

### 2. Find Your Bot
1. Open Telegram app
2. Search for your bot by username
3. Start a chat with your bot

### 3. Test It!
Send these commands to test:
- `/start` - Welcome message with buttons
- `/demo` - See images and interactive buttons
- `/gallery` - Browse image galleries
- Type "hello" - Get a friendly response with buttons

## 🎯 What Your Bot Can Do

✨ **Send Images with Buttons**
- Random images from Lorem Picsum
- Interactive buttons below each image
- Multiple image galleries (Nature, Cities, etc.)

🎮 **Interactive Games**
- Dice rolling 🎲
- Coin flipping 🪙
- More games coming soon

💭 **Smart Responses**
- Inspirational quotes
- Weather information (demo)
- Custom text responses

🔘 **Beautiful Buttons**
- Inline keyboards
- Multiple button layouts
- Responsive design

## 🛠️ Quick Customization

### Change Welcome Message
Edit line 15 in `bot.js`:
```javascript
const welcomeMessage = `🤖 Your Custom Welcome Message!`;
```

### Add New Images
Replace URLs in `bot.js`:
```javascript
{ url: 'https://your-image-url.com/image.jpg' }
```

### Add New Buttons
Add to any `inline_keyboard` array:
```javascript
[{ text: '🆕 New Button', callback_data: 'new_action' }]
```

## 🚨 Troubleshooting

**Bot not responding?**
- Check your internet connection
- Verify the bot token is correct
- Make sure the bot is running (`npm start`)

**Images not loading?**
- This is normal if the image service is down
- The bot will show a fallback message
- Try the `/demo` command again

**Need help?**
- Check the full README.md file
- Contact admin: Telegram ID `52648427812802789`

## 🎉 You're All Set!

Your bot is now running and ready to interact with users. Enjoy exploring all the features!

---

💡 **Pro Tip**: Keep the terminal window open to see bot logs and monitor activity. 