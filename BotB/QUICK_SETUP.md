# Quick Setup Guide - Dynamic Bot System

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote)
- Telegram Bot tokens (from @BotFather)

## Step 1: Install Dependencies

### BotA
```bash
cd BotA
npm install
```

### BotB
```bash
cd BotB
npm install
```

## Step 2: Configure Environment Variables

### BotA (.env)
```env
BOT_A_TOKEN=your_bot_a_token_here
MONGODB_URI=mongodb://localhost:27017/telegram-bot
BOT_B_WEBHOOK_URL=http://localhost:3001/webhook/bot-registration
```

### BotB (.env)
```env
MONGODB_URI=mongodb://localhost:27017/telegram-bot
WEBHOOK_PORT=3001
```

## Step 3: Start the Services

### Start BotB First
```bash
cd BotB
npm start
```

You should see:
```
✅ Database connected successfully
🌐 Webhook service started on port 3001
🔄 Initializing dynamic bots from database...
✅ All dynamic bots initialized successfully
🤖 BotB (Dynamic Multi-Bot System) started successfully!
```

### Start BotA
```bash
cd BotA
npm start
```

You should see:
```
🤖 BotA started successfully!
```

## Step 4: Test the System

### Test Bot Registration
1. Send `/register` to BotA
2. Follow the registration process
3. Check BotB logs for new bot instance
4. Click the direct access link provided

### Test Webhook Service
```bash
curl http://localhost:3001/health
```

### Test API Endpoints
```bash
# List active bots
curl http://localhost:3001/api/bots

# Get system stats
curl http://localhost:3001/health
```

## Step 5: Run Test Suite

```bash
cd BotB
node test_dynamic_system.js
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env files

2. **Webhook Service Not Reachable**
   - Ensure BotB is running on port 3001
   - Check firewall settings

3. **Bot Registration Fails**
   - Verify bot token is valid
   - Check database connection
   - Ensure webhook URL is correct

### Logs to Check

- BotA: Registration process logs
- BotB: Webhook service logs
- Database: Connection and query logs

## Next Steps

1. **Production Deployment**
   - Use environment variables for all secrets
   - Set up proper logging
   - Implement webhook security

2. **Monitoring**
   - Set up health checks
   - Monitor bot instances
   - Track registration metrics

3. **Scaling**
   - Load balance webhook service
   - Use Redis for session management
   - Implement rate limiting

## Support

For issues or questions:
1. Check the logs for error messages
2. Run the test suite
3. Verify environment configuration
4. Check database connectivity 