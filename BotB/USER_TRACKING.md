# User Tracking System Documentation

## Overview

The User Tracking System automatically detects and logs which user ID is messaging which BotB instance. This provides real-time visibility into user interactions across the dynamic bot system.

## Features

### 🔍 **Real-time Detection**
- Automatically detects user interactions with any BotB instance
- Logs user ID, bot username, message type, and content
- Tracks commands, text messages, and callback queries

### 📊 **Comprehensive Logging**
- User information (ID, name, username)
- Bot information (username)
- Message details (type, content, timestamp)
- Chat information (chat ID)

### 📈 **Statistics & Analytics**
- Total interactions count
- Unique users count
- Interactions per bot
- User interaction history
- Bot interaction history

## Console Output

### Real-time Interaction Logs

When a user interacts with any BotB instance, you'll see detailed console output like this:

```
🔍 USER INTERACTION DETECTED:
   👤 User ID: 123456789
   👤 User Name: John Doe
   👤 Username: @johndoe
   🤖 Bot Username: @test_bot_1
   📝 Message Type: COMMAND
   💬 Message: /start
   ⏰ Timestamp: 2024-01-15T10:30:45.123Z
   💬 Chat ID: 123456789
   ──────────────────────────────────────────
```

### Periodic Statistics

Every 5 minutes, the system prints statistics:

```
📊 USER INTERACTION STATISTICS:
   📈 Total Interactions: 150
   👥 Unique Users: 25
   🤖 Bot Interactions:
      @test_bot_1: 75 interactions
      @test_bot_2: 45 interactions
      @test_bot_3: 30 interactions
   ──────────────────────────────────────────
```

## Commands

### `/trackingstats` (Super Admin Only)

View current tracking statistics:

```
📊 User Tracking Statistics

📈 Total Interactions: 150
👥 Unique Users: 25
🤖 Current Bot: @test_bot_1
👤 Your Current Bot: @test_bot_1

🤖 Bot Interactions:
   @test_bot_1: 75 interactions
   @test_bot_2: 45 interactions
   @test_bot_3: 30 interactions
```

## API Endpoints

### Health Check with User Stats

```bash
curl http://localhost:3001/health
```

Response includes user tracking statistics:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "stats": {
    "activeBots": 3,
    "botUsernames": ["test_bot_1", "test_bot_2", "test_bot_3"],
    "totalSchedulers": 3
  },
  "userStats": {
    "totalInteractions": 150,
    "uniqueUsers": 25,
    "botInteractions": {
      "test_bot_1": 75,
      "test_bot_2": 45,
      "test_bot_3": 30
    },
    "recentInteractions": [...]
  }
}
```

## Service Methods

### Core Tracking Methods

```javascript
// Log any user interaction
userTrackingService.logUserInteraction(userId, botUsername, messageType, messageContent, ctx);

// Log specific interaction types
userTrackingService.logCommandInteraction(userId, botUsername, command, ctx);
userTrackingService.logTextInteraction(userId, botUsername, text, ctx);
userTrackingService.logCallbackInteraction(userId, botUsername, callbackData, ctx);
userTrackingService.logStartInteraction(userId, botUsername, startParam, ctx);
```

### Query Methods

```javascript
// Get user's current bot
const currentBot = userTrackingService.getUserCurrentBot(userId);

// Get all users for a specific bot
const users = userTrackingService.getBotUsers(botUsername);

// Get interaction statistics
const stats = userTrackingService.getInteractionStats();

// Get user interaction history
const history = userTrackingService.getUserHistory(userId);

// Get bot interaction history
const botHistory = userTrackingService.getBotHistory(botUsername);
```

### Utility Methods

```javascript
// Print statistics to console
userTrackingService.printStats();

// Export logs as JSON
const logs = userTrackingService.exportLogs();

// Clear old logs (older than 24 hours)
userTrackingService.clearOldLogs(24);
```

## Integration Points

### Main Controller Integration

The user tracking is automatically integrated into the main controller:

- **Start Command**: Tracks `/start` interactions
- **Text Messages**: Tracks regular text messages
- **Callback Queries**: Tracks button clicks
- **Commands**: Tracks specific commands like `/myrole`, `/systemstats`, etc.

### Webhook Service Integration

The webhook service includes user statistics in health checks and automatically prints periodic statistics.

## Testing

### Run User Tracking Test

```bash
cd BotB
node test_user_tracking.js
```

This will simulate user interactions and demonstrate the tracking functionality.

### Expected Output

```
🧪 Testing User Tracking Service...

📝 Simulating user interactions...

🔍 USER INTERACTION DETECTED:
   👤 User ID: 123456789
   👤 User Name: John Doe
   👤 Username: @johndoe
   🤖 Bot Username: @test_bot_1
   📝 Message Type: TEXT
   💬 Message: Hello, how are you?
   ⏰ Timestamp: 2024-01-15T10:30:45.123Z
   💬 Chat ID: 123456789
   ──────────────────────────────────────────

📊 Final Statistics:
📊 USER INTERACTION STATISTICS:
   📈 Total Interactions: 10
   👥 Unique Users: 3
   🤖 Bot Interactions:
      @test_bot_1: 6 interactions
      @test_bot_2: 4 interactions
   ──────────────────────────────────────────

✅ User tracking test completed!
```

## Configuration

### Memory Management

- Logs are automatically limited to 1000 entries to prevent memory issues
- Old logs are cleared every 6 hours (configurable)
- Statistics are calculated in real-time

### Performance

- Minimal performance impact
- Asynchronous logging
- Efficient data structures (Map for user-bot mapping)

## Use Cases

### 1. **User Support**
- Track which bot a user is interacting with
- View user interaction history
- Identify user patterns

### 2. **Bot Management**
- Monitor bot usage statistics
- Identify most/least active bots
- Track bot performance

### 3. **Analytics**
- User engagement metrics
- Bot popularity analysis
- Interaction pattern analysis

### 4. **Debugging**
- Trace user interactions across bots
- Identify issues with specific bots
- Monitor system health

## Security Considerations

- User data is stored in memory only (not persisted)
- No sensitive information is logged
- Logs are automatically cleaned up
- Access to statistics is restricted to super admins

## Monitoring

### Real-time Monitoring

The system provides real-time monitoring through:

1. **Console Logs**: Every interaction is logged with detailed information
2. **Periodic Statistics**: Printed every 5 minutes
3. **API Endpoints**: Health checks include user statistics
4. **Admin Commands**: `/trackingstats` for manual checking

### Alerting

You can extend the system to add alerting for:

- High interaction volumes
- User distribution anomalies
- Bot performance issues
- System health problems

## Troubleshooting

### Common Issues

1. **No logs appearing**
   - Check if userTrackingService is properly imported
   - Verify bot instances are receiving messages
   - Check console for error messages

2. **Memory usage high**
   - Logs are automatically limited to 1000 entries
   - Old logs are cleared every 6 hours
   - Consider reducing log retention if needed

3. **Statistics not updating**
   - Check if the service is properly initialized
   - Verify periodic cleanup is working
   - Check for JavaScript errors

### Debug Commands

```bash
# Check if tracking service is working
curl http://localhost:3001/health

# Test tracking functionality
node test_user_tracking.js

# View recent logs in console
# (logs are printed automatically)
```

## Future Enhancements

1. **Database Persistence**: Store logs in database for long-term analysis
2. **Advanced Analytics**: User behavior patterns, bot performance metrics
3. **Real-time Dashboard**: Web interface for monitoring
4. **Alerting System**: Automated alerts for anomalies
5. **Export Features**: Export logs in various formats 