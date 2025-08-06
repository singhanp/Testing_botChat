# Environment Variables Setup Guide

## Overview

This guide explains exactly what environment variables to add for both BotA and BotB to enable the dynamic bot system.

## BotA Environment Variables

### Required Variables

Create a file named `.env` in the `BotA` directory with the following content:

```env
# Bot Token (replace with your actual BotA token from @BotFather)
BOT_A_TOKEN=your_bot_a_token_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/telegram-bot

# BotB Webhook URL (for notifying BotB about new bot registrations)
BOT_B_WEBHOOK_URL=http://localhost:3001/webhook/bot-registration
```

### Optional Variables

```env
# Webhook timeout (in milliseconds)
WEBHOOK_TIMEOUT=5000

# Environment (development/production)
NODE_ENV=development
```

## BotB Environment Variables

### Required Variables

Create a file named `.env` in the `BotB` directory with the following content:

```env
# Database Configuration (same as BotA)
MONGODB_URI=mongodb://localhost:27017/telegram-bot

# Webhook Service Port (for receiving notifications from BotA)
WEBHOOK_PORT=3001
```

### Optional Variables

```env
# Webhook service host (default: localhost)
WEBHOOK_HOST=localhost

# Environment (development/production)
NODE_ENV=development

# Log level (debug, info, warn, error)
LOG_LEVEL=info
```

## Step-by-Step Setup

### Step 1: Create BotA .env file

1. Navigate to the `BotA` directory
2. Create a new file named `.env`
3. Add the following content:

```env
BOT_A_TOKEN=your_bot_a_token_here
MONGODB_URI=mongodb://localhost:27017/telegram-bot
BOT_B_WEBHOOK_URL=http://localhost:3001/webhook/bot-registration
```

### Step 2: Create BotB .env file

1. Navigate to the `BotB` directory
2. Create a new file named `.env`
3. Add the following content:

```env
MONGODB_URI=mongodb://localhost:27017/telegram-bot
WEBHOOK_PORT=3001
```

### Step 3: Get Your Bot Tokens

1. **For BotA**: 
   - Open Telegram and search for "@BotFather"
   - Send `/newbot`
   - Follow the instructions to create BotA
   - Copy the token and replace `your_bot_a_token_here` in BotA's `.env`

2. **For BotB**: 
   - BotB doesn't need a static token anymore
   - It will use dynamic tokens from the database

### Step 4: Configure Database

1. **Local MongoDB**:
   - Install MongoDB locally
   - Start MongoDB service
   - Use `MONGODB_URI=mongodb://localhost:27017/telegram-bot`

2. **Remote MongoDB**:
   - Update `MONGODB_URI` with your remote database URL
   - Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram-bot`

### Step 5: Test Configuration

1. **Start BotB first**:
   ```bash
   cd BotB
   npm start
   ```

2. **Start BotA**:
   ```bash
   cd BotA
   npm start
   ```

3. **Test the system**:
   ```bash
   cd BotB
   node test_dynamic_system.js
   ```

## Configuration Examples

### Development Environment

**BotA/.env**:
```env
BOT_A_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
MONGODB_URI=mongodb://localhost:27017/telegram-bot
BOT_B_WEBHOOK_URL=http://localhost:3001/webhook/bot-registration
NODE_ENV=development
```

**BotB/.env**:
```env
MONGODB_URI=mongodb://localhost:27017/telegram-bot
WEBHOOK_PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
```

### Production Environment

**BotA/.env**:
```env
BOT_A_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram-bot
BOT_B_WEBHOOK_URL=https://your-domain.com:3001/webhook/bot-registration
NODE_ENV=production
WEBHOOK_TIMEOUT=10000
```

**BotB/.env**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram-bot
WEBHOOK_PORT=3001
WEBHOOK_HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info
```

## Troubleshooting

### Common Issues

1. **"BOT_A_TOKEN is not defined"**
   - Make sure you created the `.env` file in the BotA directory
   - Verify the token is correct and not empty

2. **"MongoDB connection failed"**
   - Check if MongoDB is running
   - Verify the MONGODB_URI is correct
   - Ensure network connectivity

3. **"Webhook service not reachable"**
   - Make sure BotB is running on port 3001
   - Check if the BOT_B_WEBHOOK_URL is correct
   - Verify firewall settings

4. **"Port 3001 already in use"**
   - Change WEBHOOK_PORT in BotB's .env to a different port
   - Update BOT_B_WEBHOOK_URL in BotA's .env accordingly

### Validation Commands

```bash
# Check if .env files exist
ls -la BotA/.env
ls -la BotB/.env

# Test MongoDB connection
mongo mongodb://localhost:27017/telegram-bot --eval "db.runCommand('ping')"

# Test webhook endpoint
curl http://localhost:3001/health
```

## Security Notes

1. **Never commit .env files to version control**
2. **Use strong, unique tokens for production**
3. **Secure your MongoDB database with authentication**
4. **Use HTTPS for webhook URLs in production**
5. **Implement proper firewall rules**

## Next Steps

After setting up the environment variables:

1. Install dependencies: `npm install` in both directories
2. Start the services in order: BotB first, then BotA
3. Test the registration flow
4. Monitor the logs for any issues 