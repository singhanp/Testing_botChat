# Dynamic Bot System Documentation

## Overview

The Dynamic Bot System allows BotB to dynamically manage multiple bot instances based on registrations from BotA. When users register new bots through BotA, BotB automatically starts those bots and provides direct access functionality.

## Architecture

### Components

1. **DynamicBotManager** (`services/dynamicBotManager.js`)
   - Manages multiple bot instances
   - Handles bot lifecycle (start, stop, restart)
   - Connects to the same database as BotA

2. **WebhookService** (`services/webhookService.js`)
   - Provides REST API endpoints
   - Receives notifications from BotA
   - Manages bot instances via webhooks

3. **DirectAccessService** (`services/directAccessService.js`)
   - Handles direct access when users register bots
   - Provides seamless user experience
   - Manages pending direct access requests

4. **WebhookNotifier** (BotA: `services/webhookNotifier.js`)
   - Sends notifications to BotB when new bots are registered
   - Handles bot lifecycle events

## How It Works

### 1. Bot Registration Flow

```
User → BotA → Database → Webhook → BotB → Dynamic Bot Instance
```

1. User registers a new bot through BotA
2. BotA saves bot data to database
3. BotA sends webhook notification to BotB
4. BotB creates new bot instance dynamically
5. User gets direct access link

### 2. Dynamic Bot Management

- **Startup**: BotB loads all active bots from database on startup
- **Real-time**: New bots are started immediately when registered
- **Lifecycle**: Bots can be started, stopped, and restarted dynamically

### 3. Direct Access

- Users get a direct access link when registering
- Clicking the link grants immediate access to the bot
- No need to search for the bot manually

## Configuration

### Environment Variables

#### BotB (.env)
```env
MONGODB_URI=mongodb://localhost:27017/telegram-bot
WEBHOOK_PORT=3001
```

#### BotA (.env)
```env
MONGODB_URI=mongodb://localhost:27017/telegram-bot
BOT_B_WEBHOOK_URL=http://localhost:3001/webhook/bot-registration
```

## API Endpoints

### Webhook Endpoints

- `POST /webhook/bot-registration` - Receive bot lifecycle events
- `GET /health` - Health check
- `GET /api/bots` - List all active bots
- `POST /api/bots/:username/restart` - Restart specific bot
- `POST /api/bots/:username/stop` - Stop specific bot

### Webhook Actions

- `bot_registered` - New bot registration
- `bot_deactivated` - Bot deactivation
- `bot_updated` - Bot update

## Database Schema

The system uses the same database as BotA with the following key collections:

### Bots Collection
```javascript
{
  agentId: String,
  email: String,
  botName: String,
  botToken: String,
  botUsername: String,
  botId: Number,
  registeredBy: Number,
  userInfo: Object,
  isActive: Boolean,
  registeredAt: Date,
  lastUpdated: Date
}
```

## Usage Examples

### Starting the System

1. **Start BotA**:
   ```bash
   cd BotA
   npm install
   npm start
   ```

2. **Start BotB**:
   ```bash
   cd BotB
   npm install
   npm start
   ```

### Registering a New Bot

1. Start BotA and send `/register`
2. Follow the registration process
3. BotB automatically starts the new bot instance
4. User receives direct access link

### Direct Access

1. User clicks the direct access link from registration
2. Bot automatically starts with welcome message
3. User can immediately use bot commands

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### List Active Bots
```bash
curl http://localhost:3001/api/bots
```

### Restart Bot
```bash
curl -X POST http://localhost:3001/api/bots/username/restart
```

## Error Handling

- Webhook failures don't break registration process
- Bot startup failures are logged but don't crash the system
- Automatic cleanup of expired sessions
- Graceful shutdown of all bot instances

## Security Considerations

- Webhook endpoints should be secured in production
- Bot tokens are stored securely in database
- Direct access links expire after use
- All user data is validated before processing

## Troubleshooting

### Common Issues

1. **Bot not starting**: Check database connection and bot token validity
2. **Webhook not working**: Verify BotB webhook service is running
3. **Direct access not working**: Check if bot instance is active

### Logs

- Bot startup/shutdown logs
- Webhook notification logs
- Direct access logs
- Error logs with stack traces

## Development

### Adding New Features

1. Extend `DynamicBotManager` for new bot management features
2. Add new webhook actions in `WebhookService`
3. Update `DirectAccessService` for new access patterns
4. Modify BotA registration flow as needed

### Testing

1. Test bot registration flow end-to-end
2. Test webhook notifications
3. Test direct access functionality
4. Test bot lifecycle management

## Production Deployment

1. Use environment variables for configuration
2. Set up proper logging
3. Implement webhook security
4. Use process manager (PM2) for reliability
5. Set up monitoring and alerting 