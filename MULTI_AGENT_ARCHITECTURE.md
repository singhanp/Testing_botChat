# 🏗️ Dual-Bot Multi-Agent Architecture

## 🎯 Overview

This Telegram bot system uses a **dual-bot architecture** where:
- **Bot A**: Simple login/entry point
- **Bot B**: Full multi-agent system with role-based access control

## 🤖 Bot Architecture

### **Bot A (Login Bot)** 🔐
- **Purpose**: Entry point and authentication
- **Features**:
  - Simple welcome message
  - Login button to redirect to Bot B
  - Help information about available features
  - Clean, minimal interface

### **Bot B (Main Bot)** 🎮
- **Purpose**: Full multi-agent system with all features
- **Features**:
  - Role-based access control
  - Agent and member management
  - Games and activities
  - Image galleries
  - Statistics and reporting

## 👥 User Roles & Hierarchy

### 1. **Super Admin** 👑
- **Access Level**: Full system access
- **Capabilities**:
  - Manage all agents (add, edit, remove)
  - View system-wide statistics
  - Configure system settings
  - Broadcast messages to all users
  - Monitor all agent activities

### 2. **Agents** 👨‍💼
- **Access Level**: Manage their own team of members
- **Capabilities**:
  - Manage their assigned members (add, edit, remove)
  - View their agent statistics
  - Send messages to their members
  - Configure their agent settings
  - Monitor their members' activities

### 3. **Members** 🎮
- **Access Level**: Play games and use basic features
- **Capabilities**:
  - Play games and earn points
  - View personal statistics
  - Browse image galleries
  - Customize personal preferences
  - Receive messages from their agent

### 4. **Guests** 👤
- **Access Level**: Limited access
- **Capabilities**:
  - Basic demo features
  - Gallery access
  - Contact agents to become members

## 🔄 User Flow

### **Step 1: Entry (Bot A)**
1. User starts Bot A
2. Sees welcome message with login button
3. Clicks "Login to Main Bot"
4. Gets redirected to Bot B

### **Step 2: Main Features (Bot B)**
1. User arrives at Bot B
2. System detects their role automatically
3. Shows role-appropriate interface
4. User can access all features based on their role

## 📊 Database Structure

### Agents Database (`database/agents.json`)
```json
{
  "agentId": "agent_001",
  "chatId": 1792802789,
  "firstName": "Han",
  "lastName": "",
  "agentName": "Agent Alpha",
  "isActive": true,
  "createdAt": "2025-07-22T13:34:42.299Z",
  "lastUpdated": "2025-07-23T01:20:48.978Z",
  "settings": {
    "goodMorningEnabled": true,
    "maxMembers": 50,
    "customWelcomeMessage": "Welcome to Agent Alpha's group!"
  }
}
```

### Members Database (`database/members.json`)
```json
{
  "memberId": "member_001",
  "chatId": 7518041177,
  "firstName": "Yuven Raj",
  "lastName": "",
  "agentId": "agent_001",
  "joinedAt": "2025-07-29T06:53:30.321Z",
  "lastUpdated": "2025-07-29T06:53:30.322Z",
  "isActive": true,
  "stats": {
    "gamesPlayed": 0,
    "totalScore": 0,
    "lastGamePlayed": null
  },
  "preferences": {
    "goodMorningEnabled": true,
    "notificationsEnabled": true
  }
}
```

## 🔐 Authentication System

### Role Detection
The system automatically detects user roles based on:
1. **Super Admin**: Matches `SUPER_ADMIN_ID` environment variable
2. **Agent**: Found in `agents.json` with `isActive: true`
3. **Member**: Found in `members.json` with `isActive: true`
4. **Guest**: Not found in any database

### Permission System
Each role has specific permissions:
- **Super Admin**: `['all']`
- **Agent**: `['manage_own_members', 'view_own_stats', 'send_messages']`
- **Member**: `['play_games', 'view_own_stats']`
- **Guest**: `['basic_access']`

## 🎮 Available Commands

### Bot A Commands
- `/start` - Welcome message with login button
- `/help` - Help information about Bot B features

### Bot B Commands (Role-based)

#### For All Users
- `/start` - Role-based welcome message
- `/help` - Role-based help menu
- `/myrole` - Show current role and permissions

#### Super Admin Commands
- `/systemstats` - View system-wide statistics
- `/goodmorningstats` - View good morning subscription stats
- `/testgoodmorning` - Test good morning message system

#### Agent Commands
- `/agentstats` - View agent-specific statistics

#### Member Commands
- `/mystats` - View personal statistics

#### Good Morning Commands (Role-based)
- `/goodmorning` - Subscribe to daily messages
- `/stopgoodmorning` - Unsubscribe from daily messages

## 🔘 Interactive Buttons

### Bot A Buttons
- **Login to Main Bot** - Redirects to Bot B
- **Help** - Shows available features
- **What's Available?** - Lists all Bot B features

### Bot B Role-Based Keyboards

#### Super Admin Keyboard
- Manage Agents
- System Stats
- System Settings
- Broadcast Message

#### Agent Keyboard
- Manage Members
- Agent Stats
- Agent Settings
- Send Message

#### Member Keyboard
- Play Games
- My Stats
- Gallery
- Quick Games

#### Guest Keyboard
- Start Demo
- Show Menu
- Gallery
- Help
- Login

## 🚀 How to Use

### 1. **Setting Up Environment Variables**
```bash
# Bot A Token (Login Bot)
BOT_A_TOKEN=your_bot_a_token_here

# Bot B Token (Main Bot)
BOT_B_TOKEN=your_bot_b_token_here

# Super Admin ID
SUPER_ADMIN_ID=52648427812802789

# Server Port
PORT=3000
```

### 2. **Starting the System**
```bash
npm start
```

### 3. **User Journey**
1. **User starts Bot A** → Sees login interface
2. **Clicks Login** → Gets redirected to Bot B
3. **Bot B detects role** → Shows appropriate interface
4. **User accesses features** → Based on their role

## 📈 Benefits of This Architecture

### ✅ **Advantages**
1. **Clear Separation**: Login vs. main features
2. **Scalable**: Easy to add new agents and members
3. **Role-Based Security**: Proper access control
4. **Centralized Data**: All user data in one place
5. **Professional Flow**: Proper login experience
6. **Maintainable**: Clear bot responsibilities

### 🔧 **Technical Benefits**
1. **Modular Design**: Each bot has specific purpose
2. **Easier Debugging**: Clear separation of concerns
3. **Flexible Deployment**: Can deploy bots separately if needed
4. **Better User Experience**: Clear entry point
5. **Scalable**: Can add more specialized bots later

## 🔄 Migration Benefits

### **Before (3 Separate Feature Bots)**
- ❌ 3 different bot tokens needed
- ❌ 3 separate deployments
- ❌ 3 different codebases to maintain
- ❌ No centralized data
- ❌ Complex management
- ❌ No clear entry point

### **After (2 Bots: Login + Multi-Agent)**
- ✅ 2 bot tokens (clear purpose)
- ✅ Single deployment process
- ✅ Single codebase for main features
- ✅ Centralized data management
- ✅ Clear user flow
- ✅ Professional login experience

## 🛠️ Configuration

### Environment Variables
```bash
# Bot A Token (Login Bot)
BOT_A_TOKEN=your_bot_a_token_here

# Bot B Token (Main Bot)
BOT_B_TOKEN=your_bot_b_token_here

# Super Admin ID
SUPER_ADMIN_ID=52648427812802789

# Server Port
PORT=3000
```

### Database Files
- `database/agents.json` - Agent information
- `database/members.json` - Member information
- `database/users.json` - Legacy user data (for backward compatibility)

## 🎯 Future Enhancements

### Planned Features
1. **Advanced Login**: OAuth integration
2. **Agent Dashboard**: Web interface for agents
3. **Advanced Analytics**: Detailed statistics and reports
4. **Multi-language Support**: Internationalization
5. **Payment Integration**: Premium features
6. **API Endpoints**: External integrations
7. **Real-time Notifications**: Push notifications

### Scalability Considerations
1. **Database Migration**: Move to PostgreSQL/MongoDB
2. **Caching**: Redis for performance
3. **Load Balancing**: Multiple bot instances
4. **Microservices**: Split into smaller services
5. **Monitoring**: Advanced logging and monitoring

## 📞 Support

For questions or issues:
- **Super Admin ID**: 52648427812802789
- **Documentation**: Check this file and README.md
- **Code**: Review the controller and service files

---

**🎉 This dual-bot architecture provides a professional, scalable solution with a clear login flow and comprehensive multi-agent system!** 