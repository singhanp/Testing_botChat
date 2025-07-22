# 🤖 Interactive Telegram Bot

A feature-rich Telegram bot built with Node.js that can send images, interactive buttons, and respond to user interactions.

## ✨ Features

- 📷 **Image Sending** - Send beautiful random images from various galleries
- 🔘 **Interactive Buttons** - Inline keyboards with clickable buttons
- 🎮 **Games & Activities** - Dice rolling, coin flipping, and more
- 💭 **Inspirational Quotes** - Random motivational quotes
- 🌤️ **Weather Demo** - Sample weather information display
- 🖼️ **Image Galleries** - Browse Nature, Cities, Space, and Animal images
- ⚙️ **Settings Menu** - Interactive settings with various options
- 📱 **Responsive Design** - Clean and user-friendly interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Telegram bot token from [@BotFather](https://t.me/botfather)

### Installation

1. **Clone or download this project**
   ```bash
   git clone <your-repo-url>
   cd telegram-bot-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your bot**
   - Your bot token is already configured: `8114313056:AAEFMfh-wW7xxvLMBKNb7bkooRG8NZ43mzY`
   - Your admin ID is set to: `1792802789`

4. **Start the bot**
   ```bash
   npm start
   ```

5. **Test your bot**
   - Open Telegram and search for your bot
   - Send `/start` to begin interacting

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message with main menu buttons |
| `/help` | Show all available commands and features |
| `/demo` | Interactive demo with images and buttons |
| `/gallery` | Browse different image galleries |
| `/menu` | Show interactive menu with various options |
| `/contact` | Display contact information |
| `/quote` | Get a random inspirational quote |
| `/games` | Access games and fun activities |
| `/weather` | Show sample weather information |

## 🎯 Interactive Features

### 🖼️ Image Galleries
- **Nature** 🌿 - Beautiful landscapes and nature scenes
- **Cities** 🏙️ - Urban landscapes and architecture
- **Space** 🌌 - Space and astronomy images
- **Animals** 🐾 - Wildlife and animal photos

### 🎮 Games & Activities
- **Dice Roll** 🎲 - Roll a 6-sided dice
- **Coin Flip** 🪙 - Flip a coin (Heads or Tails)
- **Number Game** 🔢 - Coming soon
- **Quiz** ❓ - Coming soon

### 💭 Quote System
- Random inspirational quotes
- Save favorite quotes (coming soon)
- Share quotes with friends

## 🔧 Customization

### Adding New Commands

1. Add a new command handler in `bot.js`:
```javascript
bot.command('newcommand', async (ctx) => {
  await ctx.reply('Your new command response!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✨ Button', callback_data: 'button_action' }]
      ]
    }
  });
});
```

2. Add the callback handler in the `callback_query` event:
```javascript
case 'button_action':
  await ctx.editMessageText('Button clicked!');
  break;
```

### Adding New Images

Replace the image URLs in the code with your own:
```javascript
// Example: Replace this URL
{ url: 'https://picsum.photos/800/600?random=1' }

// With your own image URL
{ url: 'https://your-domain.com/your-image.jpg' }
```

### Modifying Button Layouts

Update the `inline_keyboard` arrays to customize button layouts:
```javascript
reply_markup: {
  inline_keyboard: [
    [
      { text: '🔴 Button 1', callback_data: 'action1' },
      { text: '🔵 Button 2', callback_data: 'action2' }
    ],
    [
      { text: '🟢 Full Width Button', callback_data: 'action3' }
    ]
  ]
}
```

## 📁 Project Structure

```
telegram-bot-project/
├── bot.js              # Main bot file with all functionality
├── package.json        # Project dependencies and scripts
├── README.md          # This documentation file
└── node_modules/      # Installed dependencies (auto-generated)
```

## 🛠️ Technical Details

### Dependencies
- **telegraf** - Modern Telegram bot framework for Node.js
- **dotenv** - Environment variable management

### Error Handling
The bot includes comprehensive error handling for:
- Image loading failures
- Network connectivity issues
- Invalid callback queries
- General runtime errors

### Security Features
- Token stored securely in code
- Admin ID verification
- Input validation
- Error message sanitization

## 🚀 Deployment Options

### Local Development
```bash
npm start
```

### Production Deployment
1. **Heroku**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku create your-bot-name
   git push heroku main
   ```

2. **VPS/Cloud Server**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   pm2 start bot.js --name telegram-bot
   pm2 save
   pm2 startup
   ```

3. **Docker**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   CMD ["npm", "start"]
   ```

## 📞 Support & Contact

- **Admin Telegram ID**: 1792802789
- **Bot Token**: 8114313056:AAEFMfh-wW7xxvLMBKNb7bkooRG8NZ43mzY

## 📝 License

This project is licensed under the MIT License - feel free to use and modify as needed.

## 🎉 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Happy Bot Building! 🤖✨** 