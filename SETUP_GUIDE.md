# 🚀 Quick Setup Guide - Dual-Bot Multi-Agent System

## ✅ What You Need to Do

### 1. **Update Environment Variables**
Create or update your `.env` file:
```bash
# Bot A Token (Login Bot)
BOT_A_TOKEN=8114313056:AAEFMfh-wW7xxvLMBKNb7bkooRG8NZ43mzY

# Bot B Token (Main Bot with Multi-Agent Features)
BOT_B_TOKEN=your_bot_b_token_here

# Super Admin ID (your Telegram ID)
SUPER_ADMIN_ID=52648427812802789

# Server Port
PORT=3000
```

### 2. **Start the System**
```bash
npm start
```

### 3. **Test the Dual-Bot System**

#### **Step 1: Test Bot A (Login Bot)**
1. Start Bot A in Telegram
2. Send `/start` - You'll see login interface
3. Click "Login to Main Bot" - Redirects to Bot B
4. Try `/help` - Shows available features

#### **Step 2: Test Bot B (Main Bot)**
1. After login, you'll be in Bot B
2. Send `/start` - Shows role-based interface
3. Try `/myrole` - Shows your current role
4. Access features based on your role

## 🎯 User Journey

### **Complete Flow:**
1. **User starts Bot A** → Sees login interface
2. **Clicks "Login to Main Bot"** → Gets redirected to Bot B
3. **Bot B detects role** → Shows appropriate interface
4. **User accesses features** → Based on their role

## 🎮 Role-Based Testing

### **As Super Admin** (ID: 52648427812802789)
1. Start Bot A → Click Login → Go to Bot B
2. You'll see Super Admin interface
3. Try `/systemstats` to see system statistics
4. Use "Manage Agents" button to manage agents

### **As Agent** (IDs: 1792802789, 838371796, 5445993412)
1. Start Bot A → Click Login → Go to Bot B
2. You'll see Agent interface
3. Try `/agentstats` to see your agent statistics
4. Use "Manage Members" button to manage your team

### **As Member** (ID: 7518041177)
1. Start Bot A → Click Login → Go to Bot B
2. You'll see Member interface
3. Try `/mystats` to see your personal statistics
4. Use "Play Games" button to access games

### **As Guest** (any other user)
1. Start Bot A → Click Login → Go to Bot B
2. You'll see Guest interface
3. Limited access to demo and gallery features

## 🎯 Key Commands to Test

### **Bot A Commands**
- `/start` - Welcome message with login button
- `/help` - Help information about Bot B features

### **Bot B Commands**

#### **Role Check**
- `/myrole` - Shows your current role and permissions

#### **Statistics**
- `/systemstats` - Super Admin only
- `/agentstats` - Agents only  
- `/mystats` - Members only

#### **Good Morning System**
- `/goodmorning` - Subscribe to daily messages
- `/stopgoodmorning` - Unsubscribe from daily messages
- `/goodmorningstats` - Super Admin only
- `/testgoodmorning` - Super Admin only

## 🔧 Current Database Setup

### **Agents** (3 agents configured)
- **Agent Alpha** (Han) - ID: 1792802789
- **Agent Beta** (Grey Mochi) - ID: 838371796  
- **Agent Gamma** (Kong Seh Len) - ID: 5445993412

### **Members** (3 members configured)
- **Yuven Raj** - Agent Alpha's team
- **John Doe** - Agent Alpha's team
- **Jane Smith** - Agent Beta's team

## 🎮 What Each Role Can Do

### **Super Admin** 👑
- ✅ Manage all agents
- ✅ View system statistics
- ✅ Configure system settings
- ✅ Broadcast messages
- ✅ Monitor all activities

### **Agent** 👨‍💼
- ✅ Manage their own members
- ✅ View agent statistics
- ✅ Send messages to members
- ✅ Configure agent settings
- ✅ Monitor member activities

### **Member** 🎮
- ✅ Play games
- ✅ View personal statistics
- ✅ Browse galleries
- ✅ Customize preferences
- ✅ Receive agent messages

### **Guest** 👤
- ✅ Basic demo access
- ✅ Gallery access
- ✅ Contact agents

## 🔄 Architecture Benefits

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

## 🚨 Troubleshooting

### **Bot A Not Responding**
1. Check if system is running: `npm start`
2. Verify Bot A token in `.env`
3. Check internet connection

### **Bot B Not Responding**
1. Check if system is running: `npm start`
2. Verify Bot B token in `.env`
3. Check if user came from Bot A login

### **Login Not Working**
1. Ensure both bots are running
2. Check Bot B username in login URL
3. Verify bot tokens are correct

### **Role Not Detected**
1. Check if user ID is in correct database
2. Verify database files exist
3. Check file permissions

## 📞 Need Help?

- **Super Admin ID**: 52648427812802789
- **Documentation**: `MULTI_AGENT_ARCHITECTURE.md`
- **Code**: Check controller and service files

## 🔐 Bot Configuration

### **Bot A (Login Bot)**
- **Purpose**: Entry point and authentication
- **Features**: Simple login interface
- **Redirects to**: Bot B

### **Bot B (Main Bot)**
- **Purpose**: Full multi-agent system
- **Features**: All games, galleries, role-based access
- **Database**: Manages agents and members

---

**🎉 Your dual-bot multi-agent system is ready! Test the login flow and enjoy the professional user experience!** 